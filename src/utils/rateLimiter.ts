import { supabase } from "@/lib/supabase"

interface RateLimitConfig {
    maxAttempts: number
    windowMinutes: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    login: { maxAttempts: 5, windowMinutes: 15 },
    register: { maxAttempts: 3, windowMinutes: 60 },
    sync: { maxAttempts: 10, windowMinutes: 5 },
    api_call: { maxAttempts: 100, windowMinutes: 1 },
}

export class RateLimiter {
    static async checkRateLimit(identifier: string, action: string): Promise<{ allowed: boolean; resetTime?: Date }> {
        const config = RATE_LIMITS[action]
        if (!config) {
            return { allowed: true }
        }

        const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000)

        try {
            // Clean up old records first
            await supabase.from("rate_limits").delete().lt("window_start", windowStart.toISOString())

            // Check current rate limit
            const { data: existing } = await supabase
                .from("rate_limits")
                .select("*")
                .eq("identifier", identifier)
                .eq("action", action)
                .gte("window_start", windowStart.toISOString())
                .single()

            if (!existing) {
                // First request in window
                await supabase.from("rate_limits").insert({
                    identifier,
                    action,
                    count: 1,
                    window_start: new Date().toISOString(),
                })
                return { allowed: true }
            }

            if (existing.count >= config.maxAttempts) {
                const resetTime = new Date(new Date(existing.window_start).getTime() + config.windowMinutes * 60 * 1000)
                return { allowed: false, resetTime }
            }

            // Increment counter
            await supabase
                .from("rate_limits")
                .update({ count: existing.count + 1 })
                .eq("id", existing.id)

            return { allowed: true }
        } catch (error) {
            console.error("Rate limit check failed:", error)
            // Allow request if rate limiting fails
            return { allowed: true }
        }
    }

    static async resetRateLimit(identifier: string, action: string): Promise<void> {
        try {
            await supabase.from("rate_limits").delete().eq("identifier", identifier).eq("action", action)
        } catch (error) {
            console.error("Failed to reset rate limit:", error)
        }
    }
}
