// Enhanced utility functions for SAT practice platform

export interface ParsedExplanation {
    letter: string
    content: string
    isCorrect: boolean
    isSelected: boolean
}

export interface WrongQuestion {
    id: string
    externalId: string
    question: any
    userAnswer: string
    correctAnswer: string
    timestamp: number
    attempts: number
}

export interface PracticeProgress {
    questionId: string
    answered: boolean
    isCorrect: boolean
    userAnswer: string
    timestamp: number
    checked?: boolean
}

export interface SessionStats {
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracy: number
}

// Helper function to deeply clean question data for IndexedDB storage
function cleanQuestionForStorage(question: any): any {
    if (!question) return null

    try {
        // Use JSON.parse(JSON.stringify()) to ensure deep cloning and remove non-serializable data
        const serialized = JSON.stringify(question, (_key, value) => {
            // Skip functions, undefined, symbols, and DOM elements
            if (
                typeof value === "function" ||
                typeof value === "undefined" ||
                typeof value === "symbol" ||
                (value && typeof value === "object" && value.nodeType)
            ) {
                return undefined
            }
            return value
        })

        const parsed = JSON.parse(serialized)

        // Create a clean copy with only the essential fields
        const cleanedQuestion: any = {
            external_id: parsed.external_id || "",
            stem: typeof parsed.stem === "string" ? parsed.stem : "",
            stimulus: typeof parsed.stimulus === "string" ? parsed.stimulus : undefined,
            type: parsed.type || "mcq",
            domain: parsed.domain || "",
            correct_answer: Array.isArray(parsed.correct_answer) ? parsed.correct_answer : [parsed.correct_answer || ""],
            rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
            image: typeof parsed.image === "string" ? parsed.image : undefined,
        }

        // Clean answer options if they exist
        if (parsed.answerOptions && Array.isArray(parsed.answerOptions)) {
            (cleanedQuestion as any).answerOptions = parsed.answerOptions
                .map((option: { id: any; content: any }) => {
                    if (!option || typeof option !== "object") return null
                    return {
                        id: String(option.id || ""),
                        content: String(option.content || ""),
                    }
                })
                .filter(Boolean) // Remove null entries
        }

        return cleanedQuestion
    } catch (error) {
        console.error("Error cleaning question data:", error)
        // Fallback to minimal data structure
        return {
            external_id: question.external_id || "",
            stem: String(question.stem || ""),
            type: question.type || "mcq",
            domain: question.domain || "",
            correct_answer: Array.isArray(question.correct_answer)
                ? question.correct_answer
                : [question.correct_answer || ""],
            rationale: String(question.rationale || ""),
        }
    }
}

// Enhanced explanation parser that handles the College Board format
export function parseCollegeBoardExplanation(
    rationale: string,
    correctAnswer: string,
    selectedAnswer: string,
    answerOptions: any[],
): ParsedExplanation[] {
    if (!rationale || !answerOptions) return []

    // Parse HTML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(rationale, "text/html")

    // Initialize explanations for all choices
    const explanations: Record<string, string> = {
        A: "",
        B: "",
        C: "",
        D: "",
    }

    // Get all paragraphs from the rationale
    const paragraphs = Array.from(doc.querySelectorAll("p"))
    const fullText = paragraphs.map((p) => p.innerHTML).join(" ")

    // Strategy 1: Parse individual choice explanations precisely
    const parseIndividualChoices = (): boolean => {
        let foundExplanations = false

            // For each choice, find its specific explanation
            ;["A", "B", "C", "D"].forEach((letter) => {
                // Pattern to match "Choice X is [status]. [explanation]"
                const choicePattern = new RegExp(
                    `Choice ${letter} is (correct|incorrect|the best answer)\\s*\\.?\\s*([^]*?)(?=Choice [A-D] is|$)`,
                    "i",
                )

                const match = fullText.match(choicePattern)
                if (match) {
                    const [, _status, explanation] = match

                    // Determine if this choice is actually correct based on the correctAnswer parameter
                    const isActuallyCorrect = letter === correctAnswer

                    // Clean up the explanation text
                    const cleanExplanation = explanation.trim()

                    if (isActuallyCorrect) {
                        explanations[letter] = `<p>Choice ${letter} is correct. ${cleanExplanation}</p>`
                    } else {
                        // For incorrect choices, we need to rewrite the explanation to reflect that it's wrong
                        // Look for patterns that indicate why it's wrong (like "not 28", "not the correct value", etc.)
                        if (cleanExplanation.includes("not ") || cleanExplanation.includes("incorrect")) {
                            explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation}</p>`
                        } else {
                            // If the original explanation doesn't clearly state it's wrong, we modify it
                            explanations[letter] =
                                `<p>Choice ${letter} is incorrect. ${cleanExplanation} This does not match the required condition.</p>`
                        }
                    }
                    foundExplanations = true
                }
            })

        return foundExplanations
    }

    // Strategy 2: Parse by splitting text and correcting status
    const parseBySplittingAndCorrect = (): boolean => {
        let foundExplanations = false

        // Split the text by "Choice X" patterns
        const choiceSections = fullText.split(/(?=Choice [A-D] is)/i)

        choiceSections.forEach((section) => {
            const choiceMatch = section.match(/Choice ([A-D]) is (correct|incorrect|the best answer)\.?\s*(.+?)$/is)
            if (choiceMatch) {
                const [, letter, _originalStatus, explanation] = choiceMatch

                // Determine actual correctness based on the correctAnswer parameter
                const isActuallyCorrect = letter === correctAnswer

                // Clean up the explanation to remove any trailing choice mentions
                const cleanExplanation = explanation.replace(/Choice [A-D] is.*/gi, "").trim()

                if (isActuallyCorrect) {
                    explanations[letter] = `<p>Choice ${letter} is correct. ${cleanExplanation}</p>`
                } else {
                    // For incorrect choices, modify the explanation appropriately
                    if (cleanExplanation.includes("not ") || cleanExplanation.includes("does not")) {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation}</p>`
                    } else {
                        explanations[letter] =
                            `<p>Choice ${letter} is incorrect. ${cleanExplanation} This is not the correct answer.</p>`
                    }
                }
                foundExplanations = true
            }
        })

        return foundExplanations
    }

    // Strategy 3: Parse paragraph-by-paragraph with correction
    const parseParagraphWithCorrection = (): boolean => {
        let foundExplanations = false

        paragraphs.forEach((paragraph) => {
            const text = paragraph.innerHTML

            // Look for choice mentions in this specific paragraph
            const choiceMatch = text.match(/Choice ([A-D]) is (correct|incorrect|the best answer)/i)
            if (choiceMatch) {
                const [, letter, _originalStatus] = choiceMatch

                // Determine actual correctness
                const isActuallyCorrect = letter === correctAnswer

                // Extract the explanation content
                const explanationContent = text
                    .replace(/Choice [A-D] is (correct|incorrect|the best answer)\.?\s*/gi, "")
                    .trim()

                if (isActuallyCorrect) {
                    explanations[letter] = `<p>Choice ${letter} is correct. ${explanationContent}</p>`
                } else {
                    // Check if the explanation already indicates it's wrong
                    if (
                        explanationContent.includes("not ") ||
                        explanationContent.includes("does not") ||
                        explanationContent.includes("incorrect")
                    ) {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${explanationContent}</p>`
                    } else {
                        explanations[letter] =
                            `<p>Choice ${letter} is incorrect. ${explanationContent} This does not satisfy the given conditions.</p>`
                    }
                }
                foundExplanations = true
            }
        })

        return foundExplanations
    }

    // Strategy 4: Fallback with proper status assignment
    const parseFallbackWithCorrection = (): void => {
        // For the correct answer
        const correctPattern = new RegExp(`Choice ${correctAnswer} is [^]*?(?=Choice [A-D]|$)`, "i")
        const correctMatch = fullText.match(correctPattern)

        if (correctMatch) {
            explanations[correctAnswer] = `<p>${correctMatch[0].trim()}</p>`
        } else {
            explanations[correctAnswer] = `<p>Choice ${correctAnswer} is the correct answer.</p>`
        }
        // For other choices
        ;["A", "B", "C", "D"].forEach((letter) => {
            if (letter !== correctAnswer && !explanations[letter]) {
                const choicePattern = new RegExp(`Choice ${letter} is [^]*?(?=Choice [A-D]|$)`, "i")
                const choiceMatch = fullText.match(choicePattern)

                if (choiceMatch) {
                    let content = choiceMatch[0].trim()
                    // Replace "is correct" with "is incorrect" for wrong answers
                    content = content.replace(/is correct/gi, "is incorrect")
                    explanations[letter] = `<p>${content}</p>`
                } else {
                    explanations[letter] = `<p>Choice ${letter} is incorrect.</p>`
                }
            }
        })
    }

    // Try parsing strategies in order
    let parsed = false

    if (parseIndividualChoices()) {
        parsed = true
    } else if (parseBySplittingAndCorrect()) {
        parsed = true
    } else if (parseParagraphWithCorrection()) {
        parsed = true
    }

    // If no specific explanations found, use fallback
    if (!parsed) {
        parseFallbackWithCorrection()
    }
    // Final pass: ensure all incorrect choices are properly labeled
    ;["A", "B", "C", "D"].forEach((letter) => {
        if (letter !== correctAnswer && explanations[letter]) {
            // Make sure incorrect choices don't say "is correct"
            explanations[letter] = explanations[letter].replace(/is correct/gi, "is incorrect")

            // If it still doesn't explicitly say "incorrect", add clarification
            if (
                !explanations[letter].toLowerCase().includes("incorrect") &&
                !explanations[letter].toLowerCase().includes("not ")
            ) {
                explanations[letter] = explanations[letter].replace(`Choice ${letter}`, `Choice ${letter} is incorrect.`)
            }
        }

        // Ensure we have some explanation for each choice
        if (!explanations[letter]) {
            if (letter === correctAnswer) {
                explanations[letter] = `<p>Choice ${letter} is the correct answer.</p>`
            } else {
                explanations[letter] = `<p>Choice ${letter} is incorrect.</p>`
            }
        }
    })

    // Build result array
    const choices: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"]
    return choices.map((letter) => {
        const isCorrect = letter === correctAnswer
        const isSelected = getSelectedChoiceLetter(selectedAnswer, answerOptions) === letter

        return {
            letter,
            content: explanations[letter] || "<p>No explanation available for this choice.</p>",
            isCorrect,
            isSelected,
        }
    })
}

function getSelectedChoiceLetter(selectedAnswer: string, answerOptions: any[]): string | null {
    if (!selectedAnswer || !answerOptions) return null

    const optionIndex = answerOptions.findIndex((opt) => opt.id === selectedAnswer)
    if (optionIndex === -1) return null

    return String.fromCharCode(65 + optionIndex)
}

// Fixed answer checking logic
export function checkAnswer(question: any, selectedAnswer: string): boolean {
    if (!question || !selectedAnswer) return false

    if (question.type === "mcq") {
        // For MCQ, get the correct option ID by letter
        const correctLetter = question.correct_answer[0]
        const correctIndex = correctLetter.charCodeAt(0) - 65
        const correctOptionId = question.answerOptions?.[correctIndex]?.id
        return selectedAnswer === correctOptionId
    } else if (question.type === "spr") {
        // For SPR, check against all possible correct answers
        const userAnswer = selectedAnswer.trim().toLowerCase()
        return question.correct_answer.some((answer: string) => {
            const correctAnswer = answer.trim().toLowerCase()
            // Check exact match or numeric equivalence
            return (
                userAnswer === correctAnswer ||
                (Number.parseFloat(userAnswer) === Number.parseFloat(correctAnswer) && !isNaN(Number.parseFloat(userAnswer)))
            )
        })
    }

    return false
}

// Wrong questions management with reactive updates
let wrongQuestionsUpdateCallbacks: (() => void)[] = []

export function onWrongQuestionsUpdate(callback: () => void) {
    wrongQuestionsUpdateCallbacks.push(callback)
}

export function offWrongQuestionsUpdate(callback: () => void) {
    wrongQuestionsUpdateCallbacks = wrongQuestionsUpdateCallbacks.filter((cb) => cb !== callback)
}

function notifyWrongQuestionsUpdate() {
    wrongQuestionsUpdateCallbacks.forEach((callback) => callback())
}

// IndexedDB 存储支持
let dbPromise: Promise<IDBDatabase>

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open("satPracticeDB", 1)
        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains("wrongQuestions")) {
                db.createObjectStore("wrongQuestions", { keyPath: "externalId" })
            }
            if (!db.objectStoreNames.contains("questionProgress")) {
                db.createObjectStore("questionProgress", { keyPath: "questionId" })
            }
        }
        request.onsuccess = () => {
            const db = request.result
            // 自动迁移一次已有的 localStorage 数据
            migrateLocalStorageToIDB()
            resolve(db)
        }
        request.onerror = () => reject(request.error)
    })
    return dbPromise
}

// function getFromStore(storeName: string, key: string): Promise<any> {
//     return openDB().then(
//         (db) =>
//             new Promise((resolve, reject) => {
//                 const transaction = db.transaction(storeName, "readonly")
//                 const store = transaction.objectStore(storeName)
//                 const req = store.get(key)
//                 req.onsuccess = () => resolve(req.result)
//                 req.onerror = () => reject(req.error)
//             }),
//     )
// }

function getAllFromStore(storeName: string): Promise<any[]> {
    return openDB().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, "readonly")
                const store = transaction.objectStore(storeName)
                const req = store.getAll()
                req.onsuccess = () => resolve(req.result)
                req.onerror = () => reject(req.error)
            }),
    )
}

function setToStore(storeName: string, value: any): Promise<void> {
    return openDB().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, "readwrite")
                const store = transaction.objectStore(storeName)
                const req = store.put(value)
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
            }),
    )
}

function deleteFromStore(storeName: string, key: string): Promise<void> {
    return openDB().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, "readwrite")
                const store = transaction.objectStore(storeName)
                const req = store.delete(key)
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
            }),
    )
}

function clearStore(storeName: string): Promise<void> {
    return openDB().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, "readwrite")
                const store = transaction.objectStore(storeName)
                const req = store.clear()
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
            }),
    )
}

// 修改错误题目管理：使用 IndexedDB 替代 localStorage
export async function getWrongQuestions(): Promise<WrongQuestion[]> {
    try {
        const data = await getAllFromStore("wrongQuestions")
        return data || []
    } catch (error) {
        console.warn("Failed to load wrong questions from IndexedDB:", error)
        return []
    }
}

export async function saveWrongQuestion(question: any, userAnswer: string): Promise<void> {
    try {
        console.log("Attempting to save wrong question:", question.external_id)

        // Clean the question data to ensure it's serializable
        const cleanedQuestion = cleanQuestionForStorage(question)

        if (!cleanedQuestion) {
            console.error("Failed to clean question data for storage")
            return
        }

        console.log("Cleaned question data:", cleanedQuestion)

        const wrongQuestions = await getWrongQuestions()
        const existing = wrongQuestions.find((q) => q.externalId === question.external_id)

        const wrongQuestion: WrongQuestion = {
            externalId: String(question.external_id || ""),
            question: cleanedQuestion, // Use cleaned question data
            userAnswer: String(userAnswer || ""),
            correctAnswer: String(question.correct_answer?.[0] || ""),
            timestamp: Date.now(),
            attempts: existing ? existing.attempts + 1 : 1,
            id: String(question.external_id || ""), // Use external_id as id for compatibility
        }

        console.log("Final wrong question object:", wrongQuestion)

        await setToStore("wrongQuestions", wrongQuestion)
        console.log("Successfully saved wrong question to IndexedDB")
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.error("Failed to save wrong question to IndexedDB:", error)
        // Try to save with minimal data as fallback
        try {
            const minimalWrongQuestion = {
                externalId: String(question.external_id || Date.now()),
                question: {
                    external_id: String(question.external_id || ""),
                    stem: String(question.stem || ""),
                    type: String(question.type || "mcq"),
                    correct_answer: [String(question.correct_answer?.[0] || "")],
                },
                userAnswer: String(userAnswer || ""),
                correctAnswer: String(question.correct_answer?.[0] || ""),
                timestamp: Date.now(),
                attempts: 1,
                id: String(question.external_id || Date.now()),
            }
            await setToStore("wrongQuestions", minimalWrongQuestion)
            console.log("Saved minimal wrong question data as fallback")
            notifyWrongQuestionsUpdate()
        } catch (fallbackError) {
            console.error("Even fallback save failed:", fallbackError)
        }
    }
}

export async function removeWrongQuestion(externalId: string): Promise<void> {
    try {
        await deleteFromStore("wrongQuestions", externalId)
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.warn("Failed to remove wrong question from IndexedDB:", error)
    }
}

export async function clearWrongQuestions(): Promise<void> {
    try {
        await clearStore("wrongQuestions")
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.warn("Failed to clear wrong questions in IndexedDB:", error)
    }
}

// 修改进度管理：使用 IndexedDB 替代 localStorage
export async function saveQuestionProgress(_questionId: string, progress: PracticeProgress): Promise<void> {
    try {
        await setToStore("questionProgress", progress)
    } catch (error) {
        console.warn("Failed to save question progress to IndexedDB:", error)
    }
}

export async function getQuestionProgress(): Promise<Record<string, PracticeProgress>> {
    try {
        const progresses = await getAllFromStore("questionProgress")
        const result: Record<string, PracticeProgress> = {}
        progresses.forEach((p: PracticeProgress) => {
            result[p.questionId] = p
        })
        return result
    } catch (error) {
        console.warn("Failed to load question progress from IndexedDB:", error)
        return {}
    }
}

// 修改数据导出/导入：基于 IndexedDB 数据
export async function exportWrongQuestions(): Promise<string> {
    try {
        const wrongQuestions = await getAllFromStore("wrongQuestions")
        const progress = await getQuestionProgress()
        const exportData = {
            wrongQuestions,
            progress,
            exportDate: new Date().toISOString(),
            version: "1.1",
        }
        return JSON.stringify(exportData, null, 2)
    } catch (error) {
        console.error("Failed to export data from IndexedDB:", error)
        return "{}"
    }
}

export async function importWrongQuestions(jsonData: string): Promise<boolean> {
    try {
        const data = JSON.parse(jsonData)
        if (data.wrongQuestions && Array.isArray(data.wrongQuestions)) {
            for (const item of data.wrongQuestions) {
                // Clean imported question data as well
                if (item.question) {
                    item.question = cleanQuestionForStorage(item.question)
                }
                await setToStore("wrongQuestions", item)
            }
        }
        if (data.progress && typeof data.progress === "object") {
            for (const key in data.progress) {
                await setToStore("questionProgress", data.progress[key])
            }
        }
        notifyWrongQuestionsUpdate()
        return true
    } catch (error) {
        console.error("Failed to import data into IndexedDB:", error)
        return false
    }
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    } else {
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
}

export function resetTimer(): void {
    localStorage.removeItem("sat_timer_state")
}

export function calculateAccuracy(correct: number, total: number): string {
    if (total === 0) return "0.0"
    return ((correct / total) * 100).toFixed(1)
}

export function getPerformanceLevel(accuracy: number): string {
    if (accuracy >= 90) return "Excellent"
    if (accuracy >= 80) return "Very Good"
    if (accuracy >= 70) return "Good"
    if (accuracy >= 60) return "Fair"
    return "Needs Improvement"
}

export function getPerformanceColor(accuracy: number): string {
    if (accuracy >= 80) return "text-green-600"
    if (accuracy >= 60) return "text-yellow-600"
    return "text-red-600"
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else {
        return `${minutes}m`
    }
}

export function generateStudyRecommendations(domainPerformance: Record<string, any>): string[] {
    const recommendations: string[] = []

    Object.values(domainPerformance).forEach((domain: any) => {
        const accuracy = (domain.correct / domain.total) * 100

        if (accuracy < 60) {
            recommendations.push(`Focus more practice on ${domain.name} - current accuracy: ${accuracy.toFixed(1)}%`)
        } else if (accuracy < 80) {
            recommendations.push(`Continue practicing ${domain.name} to reach mastery level`)
        }
    })

    if (recommendations.length === 0) {
        recommendations.push("Great job! Continue practicing to maintain your high performance level.")
    }

    return recommendations
}

// 新增 getSessionStats 导出函数，基于题目对象的 answered 与 isCorrect 属性
export function getSessionStats(questions: any[]): SessionStats {
    let answeredQuestions = 0
    let correctAnswers = 0
    questions.forEach((q) => {
        if (q.answered) {
            answeredQuestions++
            if (q.isCorrect) {
                correctAnswers++
            }
        }
    })
    return {
        totalQuestions: questions.length,
        answeredQuestions,
        correctAnswers,
        incorrectAnswers: answeredQuestions - correctAnswers,
        accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0,
    }
}

// 新增：自动将 localStorage 里的数据迁移到 IndexedDB
async function migrateLocalStorageToIDB(): Promise<void> {
    try {
        // 处理错误题目数据
        const localWrong = localStorage.getItem("sat_wrong_questions")
        if (localWrong) {
            const wrongs: WrongQuestion[] = JSON.parse(localWrong)
            for (const w of wrongs) {
                // Clean question data during migration
                if (w.question) {
                    w.question = cleanQuestionForStorage(w.question)
                }
                await setToStore("wrongQuestions", w)
            }
            localStorage.removeItem("sat_wrong_questions")
        }
        // 处理问题进度数据
        const localProgress = localStorage.getItem("sat_question_progress")
        if (localProgress) {
            const progressObj: Record<string, PracticeProgress> = JSON.parse(localProgress)
            for (const key in progressObj) {
                await setToStore("questionProgress", progressObj[key])
            }
            localStorage.removeItem("sat_question_progress")
        }
    } catch (error) {
        console.warn("Data migration from localStorage to IndexedDB failed:", error)
    }
}
