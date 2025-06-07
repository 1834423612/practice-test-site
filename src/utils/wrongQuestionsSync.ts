import { supabase, type QuestionMaster, type UserWrongAnswer } from "@/lib/supabase"
import { authService } from "./auth"
import { RateLimiter } from "./rateLimiter"
import { getWrongQuestions, saveWrongQuestion, markQuestionAsSynced, type WrongQuestion } from "./enhancedPracticeUtils"

export interface SyncConflict {
    localQuestion: WrongQuestion
    cloudQuestion: UserWrongAnswer
    conflictType: "different_answer" | "different_attempts" | "different_timestamp"
}

export interface SyncResult {
    success: boolean
    conflicts: SyncConflict[]
    synced: number
    errors: string[]
    rateLimited?: boolean
}

export interface ConflictResolution {
    questionId: string
    resolution: "keep_local" | "keep_cloud" | "merge"
}

class WrongQuestionsSyncService {
    private syncInProgress = false

    async checkCloudStatus(): Promise<{ hasCloudData: boolean; cloudCount: number; localCount: number }> {
        const user = authService.getUser()
        if (!user) {
            return { hasCloudData: false, cloudCount: 0, localCount: 0 }
        }

        try {
            const cloudQuestions = await this.getCloudWrongQuestions(user.id)
            const localQuestions = await getWrongQuestions()

            return {
                hasCloudData: cloudQuestions.length > 0,
                cloudCount: cloudQuestions.length,
                localCount: localQuestions.length,
            }
        } catch (error) {
            console.error("Failed to check cloud status:", error)
            return { hasCloudData: false, cloudCount: 0, localCount: 0 }
        }
    }

    // 修复：智能双向同步，避免冲突
    async intelligentBidirectionalSync(): Promise<SyncResult> {
        const user = authService.getUser()
        if (!user) {
            return { success: false, conflicts: [], synced: 0, errors: ["User not authenticated"] }
        }

        try {
            console.log("Starting intelligent bidirectional sync...")

            // 获取本地和云端数据
            const localQuestions = await getWrongQuestions()
            const cloudQuestions = await this.getCloudWrongQuestions(user.id)

            console.log(`Local questions: ${localQuestions.length}, Cloud questions: ${cloudQuestions.length}`)

            // 创建映射表便于比较
            const localMap = new Map(localQuestions.map((q) => [q.externalId, q]))
            const cloudMap = new Map(cloudQuestions.map((q) => [q.question_external_id, q]))

            const conflicts: SyncConflict[] = []
            const questionsToUpload: WrongQuestion[] = []
            const questionsToDownload: UserWrongAnswer[] = []
            const questionsToUpdate: { local: WrongQuestion; cloud: UserWrongAnswer }[] = []
            let syncedCount = 0

            // 检查本地题目
            for (const localQ of localQuestions) {
                const cloudQ = cloudMap.get(localQ.externalId)

                if (!cloudQ) {
                    // 云端没有，需要上传
                    questionsToUpload.push(localQ)
                    console.log(`Local question ${localQ.externalId} not found in cloud, will upload`)
                } else {
                    // 云端有，检查是否需要更新
                    const needsUpdate = this.shouldUpdateCloud(localQ, cloudQ)
                    if (needsUpdate) {
                        // 检查是否有真正的冲突（不可自动解决的）
                        const hasRealConflict = this.hasRealConflict(localQ, cloudQ)
                        if (hasRealConflict) {
                            const conflict = this.detectConflict(localQ, cloudQ)
                            if (conflict) {
                                conflicts.push(conflict)
                            }
                        } else {
                            // 可以自动解决，直接更新
                            questionsToUpdate.push({ local: localQ, cloud: cloudQ })
                            console.log(`Local question ${localQ.externalId} has updates, will update cloud`)
                        }
                    } else {
                        // 标记为已同步
                        if (!localQ.is_synced) {
                            await markQuestionAsSynced(localQ.externalId)
                            syncedCount++
                        }
                    }
                }
            }

            // 检查云端题目（下载本地没有的）
            for (const cloudQ of cloudQuestions) {
                const localQ = localMap.get(cloudQ.question_external_id)

                if (!localQ) {
                    // 本地没有，需要下载
                    questionsToDownload.push(cloudQ)
                    console.log(`Cloud question ${cloudQ.question_external_id} not found locally, will download`)
                }
            }

            // 执行上传（新题目）
            if (questionsToUpload.length > 0) {
                console.log(`Uploading ${questionsToUpload.length} new questions to cloud...`)
                await this.batchEnsureQuestionsInMaster(questionsToUpload)
                const uploaded = await this.batchSyncUserWrongAnswers(user.id, questionsToUpload)
                syncedCount += uploaded
            }

            // 执行更新（已存在的题目）
            if (questionsToUpdate.length > 0) {
                console.log(`Updating ${questionsToUpdate.length} existing questions in cloud...`)
                for (const { local, cloud } of questionsToUpdate) {
                    await this.updateExistingCloudQuestion(user.id, local, cloud)
                    syncedCount++
                }
            }

            // 执行下载
            if (questionsToDownload.length > 0) {
                console.log(`Downloading ${questionsToDownload.length} questions from cloud...`)
                for (const cloudQ of questionsToDownload) {
                    await this.downloadQuestionFromCloud(cloudQ)
                    syncedCount++
                }
            }

            console.log(`Bidirectional sync completed. Synced: ${syncedCount}, Conflicts: ${conflicts.length}`)

            return {
                success: true,
                conflicts,
                synced: syncedCount,
                errors: [],
            }
        } catch (error) {
            console.error("Intelligent bidirectional sync error:", error)
            return { success: false, conflicts: [], synced: 0, errors: [String(error)] }
        }
    }

    // 新增：检查是否有真正的冲突（不可自动解决的）
    private hasRealConflict(localQ: WrongQuestion, cloudQ: UserWrongAnswer): boolean {
        // 如果本地数据明显更新（更多尝试次数或更新的时间），则不是冲突
        if (localQ.attempts > cloudQ.attempts) {
            return false
        }

        const localTime = new Date(localQ.timestamp).getTime()
        const cloudTime = new Date(cloudQ.last_wrong_at).getTime()
        if (localTime > cloudTime + 60000) {
            // 本地比云端新1分钟以上
            return false
        }

        // 如果答案不同且时间相近，则是真正的冲突
        if (localQ.userAnswer !== cloudQ.user_answer && Math.abs(localTime - cloudTime) < 300000) {
            // 5分钟内
            return true
        }

        return false
    }

    // 新增：更新已存在的云端题目
    private async updateExistingCloudQuestion(
        userId: string,
        localQ: WrongQuestion,
        cloudQ: UserWrongAnswer,
    ): Promise<void> {
        const mergedData: Partial<UserWrongAnswer> = {
            user_answer: localQ.userAnswer,
            correct_answer: localQ.correctAnswer || cloudQ.correct_answer,
            attempts: Math.max(localQ.attempts, cloudQ.attempts),
            first_wrong_at: new Date(Math.min(localQ.timestamp, new Date(cloudQ.first_wrong_at).getTime())).toISOString(),
            last_wrong_at: new Date(Math.max(localQ.timestamp, new Date(cloudQ.last_wrong_at).getTime())).toISOString(),
            is_synced: true,
            sync_time: new Date().toISOString(),
        }

        // 使用 UPDATE 而不是 UPSERT 来避免唯一约束冲突
        const { error } = await supabase
            .from("user_wrong_answers")
            .update(mergedData)
            .eq("user_id", userId)
            .eq("question_external_id", localQ.externalId)

        if (error) {
            console.error("Failed to update existing cloud question:", error)
            throw error
        }

        await markQuestionAsSynced(localQ.externalId)
    }

    // 判断是否需要更新云端数据
    private shouldUpdateCloud(localQ: WrongQuestion, cloudQ: UserWrongAnswer): boolean {
        // 检查尝试次数
        if (localQ.attempts > cloudQ.attempts) {
            return true
        }

        // 检查时间戳（本地更新）
        const localTime = new Date(localQ.timestamp).getTime()
        const cloudTime = new Date(cloudQ.last_wrong_at).getTime()
        if (localTime > cloudTime) {
            return true
        }

        // 检查答案是否不同
        if (localQ.userAnswer !== cloudQ.user_answer) {
            return true
        }

        return false
    }

    async smartSync(): Promise<SyncResult> {
        const user = authService.getUser()
        if (!user) {
            return { success: false, conflicts: [], synced: 0, errors: ["User not authenticated"] }
        }

        try {
            // 使用新的智能双向同步
            return await this.intelligentBidirectionalSync()
        } catch (error) {
            console.error("Smart sync error:", error)
            return { success: false, conflicts: [], synced: 0, errors: [String(error)] }
        }
    }

    async forceUploadAll(): Promise<SyncResult> {
        const user = authService.getUser()
        if (!user) {
            return { success: false, conflicts: [], synced: 0, errors: ["User not authenticated"] }
        }

        try {
            const localQuestions = await getWrongQuestions()
            if (localQuestions.length === 0) {
                return { success: true, conflicts: [], synced: 0, errors: [] }
            }

            console.log(`Force uploading all ${localQuestions.length} questions...`)

            // Mark all questions as unsynced first to force upload
            for (const question of localQuestions) {
                question.is_synced = false
            }

            // Batch ensure questions exist in master table
            await this.batchEnsureQuestionsInMaster(localQuestions)

            // Batch sync user wrong answers
            const synced = await this.batchSyncUserWrongAnswers(user.id, localQuestions)

            return { success: true, conflicts: [], synced, errors: [] }
        } catch (error) {
            console.error("Force upload error:", error)
            return { success: false, conflicts: [], synced: 0, errors: [String(error)] }
        }
    }

    async syncToCloud(): Promise<SyncResult> {
        if (this.syncInProgress) {
            return { success: false, conflicts: [], synced: 0, errors: ["Sync already in progress"] }
        }

        const user = authService.getUser()
        if (!user) {
            return { success: false, conflicts: [], synced: 0, errors: ["User not authenticated"] }
        }

        // Check rate limit
        const rateCheck = await RateLimiter.checkRateLimit(user.id, "sync")
        if (!rateCheck.allowed) {
            return {
                success: false,
                conflicts: [],
                synced: 0,
                errors: ["Rate limit exceeded. Please try again later."],
                rateLimited: true,
            }
        }

        this.syncInProgress = true

        try {
            // Get all local questions, not just unsynced ones for comparison
            const allLocalQuestions = await getWrongQuestions()
            const unsyncedQuestions = allLocalQuestions.filter((q) => !q.is_synced)

            console.log(`Total local questions: ${allLocalQuestions.length}`)
            console.log(`Unsynced questions: ${unsyncedQuestions.length}`)

            if (unsyncedQuestions.length === 0) {
                console.log("No unsynced questions found")
                return { success: true, conflicts: [], synced: 0, errors: [] }
            }

            // Get existing cloud questions for this user
            const cloudQuestions = await this.getCloudWrongQuestions(user.id)
            const cloudQuestionMap = new Map(cloudQuestions.map((q) => [q.question_external_id, q]))

            console.log(`Cloud questions found: ${cloudQuestions.length}`)

            const conflicts: SyncConflict[] = []
            const questionsToSync: WrongQuestion[] = []

            // Check for conflicts and prepare sync batches
            for (const localQ of unsyncedQuestions) {
                const cloudQ = cloudQuestionMap.get(localQ.externalId)

                if (cloudQ) {
                    const conflict = this.detectConflict(localQ, cloudQ)
                    if (conflict) {
                        conflicts.push(conflict)
                        continue
                    }
                }

                questionsToSync.push(localQ)
            }

            console.log(`Questions to sync: ${questionsToSync.length}`)
            console.log(`Conflicts found: ${conflicts.length}`)

            if (questionsToSync.length > 0) {
                // Batch ensure questions exist in master table
                await this.batchEnsureQuestionsInMaster(questionsToSync)

                // Batch sync user wrong answers
                const synced = await this.batchSyncUserWrongAnswers(user.id, questionsToSync)

                return { success: true, conflicts, synced, errors: [] }
            }

            return { success: true, conflicts, synced: 0, errors: [] }
        } catch (error) {
            console.error("Batch sync error:", error)
            return { success: false, conflicts: [], synced: 0, errors: [String(error)] }
        } finally {
            this.syncInProgress = false
        }
    }

    async syncSingleQuestionImmediately(question: any, userAnswer: string): Promise<boolean> {
        const user = authService.getUser()
        if (!user) {
            console.log("User not authenticated, skipping immediate sync")
            return false
        }

        try {
            console.log("Immediately syncing wrong question:", question.external_id)

            // First ensure question exists in master table
            await this.ensureQuestionInMaster(question)

            // Then sync user's wrong answer
            const correctAnswer = Array.isArray(question.correct_answer)
                ? question.correct_answer[0]
                : String(question.correct_answer || "A")

            const userWrongAnswer: Partial<UserWrongAnswer> = {
                user_id: user.id,
                question_external_id: question.external_id,
                user_answer: userAnswer,
                correct_answer: correctAnswer,
                attempts: 1,
                first_wrong_at: new Date().toISOString(),
                last_wrong_at: new Date().toISOString(),
                is_synced: true,
                sync_time: new Date().toISOString(),
            }

            // 使用 INSERT 而不是 GET
            const { error } = await supabase.from("user_wrong_answers").upsert(userWrongAnswer, {
                onConflict: "user_id,question_external_id",
            })

            if (error) {
                console.error("Failed to sync single question:", error)
                return false
            }

            console.log("Successfully synced question immediately")
            return true
        } catch (error) {
            console.error("Immediate sync error:", error)
            return false
        }
    }

    // 新增：删除云端错题
    async deleteCloudWrongQuestion(questionExternalId: string): Promise<boolean> {
        const user = authService.getUser()
        if (!user) {
            console.log("User not authenticated, skipping cloud deletion")
            return false
        }

        try {
            console.log("Deleting wrong question from cloud:", questionExternalId)

            const { error } = await supabase
                .from("user_wrong_answers")
                .delete()
                .eq("user_id", user.id)
                .eq("question_external_id", questionExternalId)

            if (error) {
                console.error("Failed to delete question from cloud:", error)
                return false
            }

            console.log("Successfully deleted question from cloud")
            return true
        } catch (error) {
            console.error("Cloud deletion error:", error)
            return false
        }
    }

    private async batchEnsureQuestionsInMaster(questions: WrongQuestion[]): Promise<void> {
        if (questions.length === 0) return

        const questionsToInsert: Partial<QuestionMaster>[] = []
        const existingQuestionIds = new Set()

        // Check which questions already exist - 这里使用 SELECT (GET)
        const { data: existingQuestions } = await supabase
            .from("questions_master")
            .select("external_id")
            .in(
                "external_id",
                questions.map((q) => q.externalId),
            )

        if (existingQuestions) {
            existingQuestions.forEach((q) => existingQuestionIds.add(q.external_id))
        }

        // Prepare questions that need to be inserted
        for (const question of questions) {
            if (!existingQuestionIds.has(question.externalId)) {
                questionsToInsert.push({
                    external_id: question.externalId,
                    question_data: question.question,
                    domain: question.question.domain || "",
                    type: question.question.type || "mcq",
                })
            }
        }

        // Batch insert new questions - 使用 INSERT (POST)
        if (questionsToInsert.length > 0) {
            console.log(`Batch inserting ${questionsToInsert.length} questions to master table`)
            const { error } = await supabase.from("questions_master").insert(questionsToInsert)
            if (error) {
                console.error("Failed to batch insert questions to master:", error)
                throw error
            }
        }
    }

    private async batchSyncUserWrongAnswers(userId: string, questions: WrongQuestion[]): Promise<number> {
        if (questions.length === 0) return 0

        const userWrongAnswers: Partial<UserWrongAnswer>[] = questions.map((q) => ({
            user_id: userId,
            question_external_id: q.externalId,
            user_answer: q.userAnswer,
            correct_answer: q.correctAnswer,
            attempts: q.attempts,
            first_wrong_at: new Date(q.timestamp).toISOString(),
            last_wrong_at: new Date(q.timestamp).toISOString(),
            is_synced: true,
            sync_time: new Date().toISOString(),
        }))

        console.log(`Batch syncing ${userWrongAnswers.length} user wrong answers`)

        // 使用 UPSERT (POST/PUT) 而不是 GET
        const { error } = await supabase.from("user_wrong_answers").upsert(userWrongAnswers, {
            onConflict: "user_id,question_external_id",
        })

        if (error) {
            console.error("Failed to batch sync user wrong answers:", error)
            throw error
        }

        // Mark questions as synced locally
        for (const question of questions) {
            await markQuestionAsSynced(question.externalId)
        }

        return questions.length
    }

    private async ensureQuestionInMaster(question: any): Promise<void> {
        // 使用 SELECT (GET) 检查是否存在
        const { data: existing } = await supabase
            .from("questions_master")
            .select("external_id")
            .eq("external_id", question.external_id)
            .single()

        if (!existing) {
            // 使用 INSERT (POST) 插入新数据
            const { error } = await supabase.from("questions_master").insert({
                external_id: question.external_id,
                question_data: question,
                domain: question.domain || "",
                type: question.type || "mcq",
            })

            if (error) {
                console.error("Failed to insert question to master:", error)
                throw error
            }
        }
    }

    private async getCloudWrongQuestions(userId: string): Promise<UserWrongAnswer[]> {
        // 使用 SELECT (GET) 获取数据
        const { data, error } = await supabase.from("user_wrong_answers").select("*").eq("user_id", userId)

        if (error) throw error
        return data || []
    }

    private detectConflict(localQ: WrongQuestion, cloudQ: UserWrongAnswer): SyncConflict | null {
        if (localQ.userAnswer !== cloudQ.user_answer) {
            return {
                localQuestion: localQ,
                cloudQuestion: cloudQ,
                conflictType: "different_answer",
            }
        }

        if (localQ.attempts !== cloudQ.attempts) {
            return {
                localQuestion: localQ,
                cloudQuestion: cloudQ,
                conflictType: "different_attempts",
            }
        }

        const localTime = new Date(localQ.timestamp).getTime()
        const cloudTime = new Date(cloudQ.last_wrong_at).getTime()

        if (Math.abs(localTime - cloudTime) > 60000) {
            return {
                localQuestion: localQ,
                cloudQuestion: cloudQ,
                conflictType: "different_timestamp",
            }
        }

        return null
    }

    // 修复：冲突解决方法
    async resolveConflicts(resolutions: ConflictResolution[]): Promise<boolean> {
        const user = authService.getUser()
        if (!user) return false

        try {
            for (const resolution of resolutions) {
                const localQuestions = await getWrongQuestions()
                const localQ = localQuestions.find((q) => q.externalId === resolution.questionId)

                if (!localQ) continue

                const { data: cloudQ } = await supabase
                    .from("user_wrong_answers")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("question_external_id", resolution.questionId)
                    .single()

                if (!cloudQ) continue

                switch (resolution.resolution) {
                    case "keep_local":
                        // 使用 UPDATE 而不是 UPSERT 来避免唯一约束冲突
                        await this.updateExistingCloudQuestion(user.id, localQ, cloudQ)
                        break
                    case "keep_cloud":
                        await this.downloadQuestionFromCloud(cloudQ)
                        break
                    case "merge":
                        await this.mergeQuestions(user.id, localQ, cloudQ)
                        break
                }
            }

            return true
        } catch (error) {
            console.error("Conflict resolution error:", error)
            return false
        }
    }

    private async downloadQuestionFromCloud(cloudQ: UserWrongAnswer): Promise<void> {
        // Get full question data from master table - 使用 SELECT (GET)
        const { data: questionMaster } = await supabase
            .from("questions_master")
            .select("*")
            .eq("external_id", cloudQ.question_external_id)
            .single()

        if (questionMaster) {
            await saveWrongQuestion(questionMaster.question_data, cloudQ.user_answer)
            await markQuestionAsSynced(cloudQ.question_external_id)
        }
    }

    private async mergeQuestions(userId: string, localQ: WrongQuestion, cloudQ: UserWrongAnswer): Promise<void> {
        const mergedData: Partial<UserWrongAnswer> = {
            user_answer: localQ.userAnswer,
            correct_answer: localQ.correctAnswer || cloudQ.correct_answer,
            attempts: Math.max(localQ.attempts, cloudQ.attempts),
            first_wrong_at: new Date(Math.min(localQ.timestamp, new Date(cloudQ.first_wrong_at).getTime())).toISOString(),
            last_wrong_at: new Date(Math.max(localQ.timestamp, new Date(cloudQ.last_wrong_at).getTime())).toISOString(),
            is_synced: true,
            sync_time: new Date().toISOString(),
        }

        // 使用 UPDATE 而不是 UPSERT 来避免唯一约束冲突
        const { error } = await supabase
            .from("user_wrong_answers")
            .update(mergedData)
            .eq("user_id", userId)
            .eq("question_external_id", localQ.externalId)

        if (error) throw error

        await saveWrongQuestion(localQ.question, localQ.userAnswer)
        await markQuestionAsSynced(localQ.externalId)
    }

    // 修复：批量下载云端题目，避免多次请求
    async syncFromCloud(): Promise<boolean> {
        const user = authService.getUser()
        if (!user) return false

        try {
            console.log("Starting batch download from cloud...")

            // 一次性获取所有云端题目和对应的题目数据
            const { data: cloudQuestions, error: cloudError } = await supabase
                .from("user_wrong_answers")
                .select(`
          *,
          questions_master!inner(*)
        `)
                .eq("user_id", user.id)

            if (cloudError) {
                console.error("Failed to fetch cloud questions:", cloudError)
                return false
            }

            if (!cloudQuestions || cloudQuestions.length === 0) {
                console.log("No cloud questions found")
                return true
            }

            console.log(`Found ${cloudQuestions.length} cloud questions, downloading...`)

            // 批量处理所有题目
            for (const cloudQ of cloudQuestions) {
                try {
                    // 直接使用已经 JOIN 的题目数据，避免额外请求
                    const questionData = (cloudQ as any).questions_master
                    if (questionData) {
                        await saveWrongQuestion(questionData.question_data, cloudQ.user_answer)
                        await markQuestionAsSynced(cloudQ.question_external_id)
                    }
                } catch (error) {
                    console.error(`Failed to download question ${cloudQ.question_external_id}:`, error)
                    // 继续处理其他题目，不因单个题目失败而中断
                }
            }

            console.log("Batch download completed successfully")
            return true
        } catch (error) {
            console.error("Sync from cloud error:", error)
            return false
        }
    }
}

export const wrongQuestionsSyncService = new WrongQuestionsSyncService()
