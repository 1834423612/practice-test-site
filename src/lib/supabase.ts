import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced database types
export interface User {
    id: string
    username: string
    email: string
    created_at: string
    updated_at: string
    last_login?: string
    login_attempts: number
    locked_until?: string
    is_verified: boolean
}

export interface UserSession {
    id: string
    user_id: string
    browser_ua: string
    ip_address: string
    device_fingerprint: string
    login_time: string
    last_activity: string
    is_active: boolean
    created_at: string
}

export interface QuestionMaster {
    external_id: string
    question_data: any
    domain: string
    type: string
    difficulty_level?: number
    created_at: string
    updated_at: string
}

export interface UserWrongAnswer {
    id: string
    user_id: string
    question_external_id: string
    user_answer: string
    correct_answer: string
    attempts: number
    first_wrong_at: string
    last_wrong_at: string
    is_synced: boolean
    sync_time: string
    created_at: string
    updated_at: string
}

export interface QuestionProgress {
    id: string
    user_id: string
    question_id: string
    answered: boolean
    is_correct: boolean
    user_answer: string
    timestamp: string
    created_at: string
    updated_at: string
}

export interface RateLimit {
    id: string
    identifier: string
    action: string
    count: number
    window_start: string
    created_at: string
}

export interface WrongQuestionCloud {
    user_id: string
    external_id: string
    question_data: any
    user_answer: string
    correct_answer: string
    domain: string
    attempts: number
    first_wrong_at: string
    last_wrong_at: string
    is_synced: boolean
    sync_time: string
    created_at: string
    updated_at: string
}
