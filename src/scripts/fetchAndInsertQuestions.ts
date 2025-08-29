import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import pLimit from 'p-limit';
import dotenv from 'dotenv';

dotenv.config(); // 加载 .env 文件

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Question {
    external_id: string;
    question_data: any;
    domain: string;
    type: string;
    difficulty_level?: number;
}

const FETCH_IDS_URL = 'https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-questions';
const FETCH_QUESTION_URL = 'https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-question';
const MAX_CONCURRENT_REQUESTS = 2; // 每秒最多 2 个请求
const DELAY_BETWEEN_BATCHES = 500; // 每批次请求间隔 500ms
const BATCH_SIZE = 50; // 每批次处理的题目数量
const BATCH_DELAY = 3000; // 每批次之间的延迟时间（毫秒）

// Fetch all question IDs for a given domain
const fetchQuestionIdsByDomain = async (domain: string): Promise<string[]> => {
    try {
        console.log(`Fetching question IDs for domain: ${domain}`);
        const response = await axios.post(FETCH_IDS_URL, {
            domain,
            asmtEventId: process.env.DEFAULT_ASMT_EVENT_ID || 100,
            test: process.env.DEFAULT_TEST_ID || 1,
        });
        console.log(`Successfully fetched question IDs for domain: ${domain}`);
        return response.data.map((q: any) => q.external_id);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to fetch question IDs for domain ${domain}:`, error.response?.data || error.message);
        } else {
            console.error(`Failed to fetch question IDs for domain ${domain}:`, error);
        }
        return [];
    }
};

// Fetch detailed question data by ID
const fetchQuestionById = async (id: string, domain: string): Promise<Question | null> => {
    try {
        console.log(`Fetching question details for ID: ${id}`);
        const response = await axios.post(FETCH_QUESTION_URL, {
            external_id: id,
        });
        console.log(`Successfully fetched question details for ID: ${id}`);
        const q = response.data;

        // 如果 external_id 缺失，尝试从请求 ID 补充
        const externalId = q.external_id || id;

        return {
            external_id: externalId,
            question_data: q,
            domain: q.domain || domain || '', // 如果 API 返回的 domain 为空，使用默认值
            type: q.type || 'mcq',
            difficulty_level: q.difficulty_level || null, // 如果 API 返回的 difficulty_level 为空，使用 null
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to fetch question details for ID ${id}:`, error.response?.data || error.message);
        } else {
            console.error(`Failed to fetch question details for ID ${id}:`, (error as Error).message || error);
        }
        return null;
    }
};

// Insert or update question in the database
const insertOrUpdateQuestion = async (question: Question): Promise<void> => {
    try {
        // 验证 question 对象的完整性
        if (!question.external_id || !question.question_data) {
            console.error(`Invalid question data:`, question);
            return;
        }

        const { data: existingQuestion } = await supabase
            .from('questions_master')
            .select('external_id, question_data, domain, difficulty_level')
            .eq('external_id', question.external_id)
            .single();

        if (existingQuestion) {
            // 如果题目已经存在且完整，则跳过
            if (existingQuestion.domain && existingQuestion.difficulty_level !== null) {
                console.log(`Question ${question.external_id} already exists. Skipping.`);
                return;
            }

            // 如果部分字段缺失，进行补充更新
            const { error: updateError } = await supabase
                .from('questions_master')
                .update({
                    question_data: question.question_data,
                    domain: question.domain,
                    type: question.type,
                    difficulty_level: question.difficulty_level,
                })
                .eq('external_id', question.external_id);

            if (updateError) {
                throw updateError;
            }

            console.log(`Question ${question.external_id} updated successfully.`);
        } else {
            // 插入新题目
            const { error: insertError } = await supabase.from('questions_master').insert([question]);

            if (insertError) {
                throw insertError;
            }

            console.log(`Question ${question.external_id} inserted successfully.`);
        }
    } catch (error) {
        console.error(`Failed to insert or update question ${question.external_id}:`, error);
    }
};

// Process a single domain
const processDomain = async (domain: string): Promise<void> => {
    console.log(`Processing domain: ${domain}`);
    const questionIds = await fetchQuestionIdsByDomain(domain);

    for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
        const batch = questionIds.slice(i, i + BATCH_SIZE);

        const limit = pLimit(MAX_CONCURRENT_REQUESTS);
        const tasks = batch.map((id) =>
            limit(async () => {
                const question = await fetchQuestionById(id, domain);
                if (question) {
                    await insertOrUpdateQuestion(question);
                }
            })
        );

        await Promise.all(tasks);
        console.log(`Processed batch ${i / BATCH_SIZE + 1} for domain: ${domain}`);

        if (i + BATCH_SIZE < questionIds.length) {
            console.log(`Sleeping for ${BATCH_DELAY / 1000} seconds before next batch...`);
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
    }

    console.log(`Finished processing domain: ${domain}`);
};

// Main function
const main = async () => {
    const domains = ['INI', 'CAS', 'EOI', 'SEC', 'H', 'P', 'Q', 'S']; // 所有需要处理的 domain
    for (const domain of domains) {
        await processDomain(domain);
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES)); // 批次间隔
    }
    console.log('All domains processed.');
};

main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});