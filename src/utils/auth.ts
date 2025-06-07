import { supabase, type User, type UserSession } from "@/lib/supabase"
import { generateDeviceFingerprint, getClientIP, getBrowserUA } from "./deviceUtils"
import { RateLimiter } from "./rateLimiter"
import bcrypt from "bcryptjs"

export interface AuthUser extends User {
    sessions?: UserSession[]
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    username: string
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    user?: AuthUser
    error?: string
    rateLimited?: boolean
    resetTime?: Date
}

class AuthService {
    private currentUser: AuthUser | null = null
    private sessionCheckInterval: NodeJS.Timeout | null = null

    constructor() {
        // 启动时尝试恢复会话
        this.initializeSession()
        // 定期检查会话有效性
        this.startSessionCheck()
    }

    private async initializeSession(): Promise<void> {
        try {
            // 从 localStorage 恢复用户信息
            const storedUser = localStorage.getItem("sat_current_user")
            const storedSessionTime = localStorage.getItem("sat_session_time")

            if (storedUser && storedSessionTime) {
                const sessionTime = Number.parseInt(storedSessionTime)
                const now = Date.now()

                // 检查会话是否在有效期内（7天）
                if (now - sessionTime < 7 * 24 * 60 * 60 * 1000) {
                    const userData = JSON.parse(storedUser)

                    // 验证会话是否仍然有效
                    const isValid = await this.validateSession(userData.id)
                    if (isValid) {
                        this.currentUser = userData
                        console.log("Session restored for user:", userData.username)

                        // 更新最后活动时间
                        await this.updateSessionActivity(userData.id)
                    } else {
                        // 会话无效，清除本地存储
                        this.clearLocalSession()
                    }
                } else {
                    // 会话过期，清除本地存储
                    this.clearLocalSession()
                }
            }
        } catch (error) {
            console.error("Failed to initialize session:", error)
            this.clearLocalSession()
        }
    }

    private async validateSession(userId: string): Promise<boolean> {
        try {
            const deviceFingerprint = await generateDeviceFingerprint()

            const { data: session } = await supabase
                .from("user_sessions")
                .select("*")
                .eq("user_id", userId)
                .eq("device_fingerprint", deviceFingerprint)
                .eq("is_active", true)
                .single()

            return !!session
        } catch (error) {
            console.error("Session validation failed:", error)
            return false
        }
    }

    private async updateSessionActivity(userId: string): Promise<void> {
        try {
            const deviceFingerprint = await generateDeviceFingerprint()

            await supabase
                .from("user_sessions")
                .update({ last_activity: new Date().toISOString() })
                .eq("user_id", userId)
                .eq("device_fingerprint", deviceFingerprint)
                .eq("is_active", true)
        } catch (error) {
            console.error("Failed to update session activity:", error)
        }
    }

    private startSessionCheck(): void {
        // 每5分钟检查一次会话
        this.sessionCheckInterval = setInterval(
            async () => {
                if (this.currentUser) {
                    const isValid = await this.validateSession(this.currentUser.id)
                    if (!isValid) {
                        console.log("Session expired, logging out user")
                        await this.logout()
                    } else {
                        // 更新活动时间
                        await this.updateSessionActivity(this.currentUser.id)
                    }
                }
            },
            5 * 60 * 1000,
        ) // 5分钟
    }

    private clearLocalSession(): void {
        localStorage.removeItem("sat_current_user")
        localStorage.removeItem("sat_session_time")
        this.currentUser = null
    }

    private saveLocalSession(user: AuthUser): void {
        localStorage.setItem("sat_current_user", JSON.stringify(user))
        localStorage.setItem("sat_session_time", Date.now().toString())
    }

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const clientIP = await getClientIP()

        // Check rate limit
        const rateCheck = await RateLimiter.checkRateLimit(clientIP, "register")
        if (!rateCheck.allowed) {
            return {
                success: false,
                error: "Too many registration attempts. Please try again later.",
                rateLimited: true,
                resetTime: rateCheck.resetTime,
            }
        }

        try {
            // Validate input
            if (!this.validateEmail(credentials.email)) {
                return { success: false, error: "Invalid email format" }
            }

            if (!this.validatePassword(credentials.password)) {
                return { success: false, error: "Password must be at least 8 characters long" }
            }

            if (!this.validateUsername(credentials.username)) {
                return {
                    success: false,
                    error: "Username must be 3-50 characters long and contain only letters, numbers, and underscores",
                }
            }

            // Check if username already exists
            const { data: existingUser } = await supabase
                .from("users")
                .select("username")
                .eq("username", credentials.username)
                .single()

            if (existingUser) {
                return { success: false, error: "Username already exists" }
            }

            // Check if email already exists
            const { data: existingEmail } = await supabase
                .from("users")
                .select("email")
                .eq("email", credentials.email)
                .single()

            if (existingEmail) {
                return { success: false, error: "Email already registered" }
            }

            // Hash password
            const passwordHash = await bcrypt.hash(credentials.password, 12)

            // Create user
            const { data: userData, error: userError } = await supabase
                .from("users")
                .insert({
                    username: credentials.username,
                    email: credentials.email,
                    password_hash: passwordHash,
                    is_verified: true, // Auto-verify for now
                })
                .select()
                .single()

            if (userError) {
                return { success: false, error: userError.message }
            }

            // Create session
            await this.createSession(userData.id)

            this.currentUser = userData
            this.saveLocalSession(userData)

            // 清理旧会话
            await this.cleanupOldSessions()

            return { success: true, user: userData }
        } catch (error) {
            console.error("Registration error:", error)
            return { success: false, error: "Registration failed" }
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const clientIP = await getClientIP()

        // Check rate limit
        const rateCheck = await RateLimiter.checkRateLimit(clientIP, "login")
        if (!rateCheck.allowed) {
            return {
                success: false,
                error: "Too many login attempts. Please try again later.",
                rateLimited: true,
                resetTime: rateCheck.resetTime,
            }
        }

        try {
            // Get user by email
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("email", credentials.email)
                .single()

            if (userError || !userData) {
                return { success: false, error: "Invalid email or password" }
            }

            // Check if account is locked
            if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
                return { success: false, error: "Account is temporarily locked. Please try again later." }
            }

            // Verify password
            const passwordValid = await bcrypt.compare(credentials.password, userData.password_hash)

            if (!passwordValid) {
                // Increment login attempts
                const newAttempts = userData.login_attempts + 1
                const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null // Lock for 30 minutes after 5 attempts

                await supabase
                    .from("users")
                    .update({
                        login_attempts: newAttempts,
                        locked_until: lockUntil?.toISOString(),
                    })
                    .eq("id", userData.id)

                return { success: false, error: "Invalid email or password" }
            }

            // Reset login attempts on successful login
            await supabase
                .from("users")
                .update({
                    login_attempts: 0,
                    locked_until: null,
                    last_login: new Date().toISOString(),
                })
                .eq("id", userData.id)

            // Create session
            await this.createSession(userData.id)

            // Reset rate limit on successful login
            await RateLimiter.resetRateLimit(clientIP, "login")

            this.currentUser = userData
            this.saveLocalSession(userData)

            // 清理旧会话
            await this.cleanupOldSessions()

            return { success: true, user: userData }
        } catch (error) {
            console.error("Login error:", error)
            return { success: false, error: "Login failed" }
        }
    }

    async logout(): Promise<void> {
        try {
            if (this.currentUser) {
                // Mark current session as inactive
                const deviceFingerprint = await generateDeviceFingerprint()
                await supabase
                    .from("user_sessions")
                    .update({ is_active: false })
                    .eq("user_id", this.currentUser.id)
                    .eq("device_fingerprint", deviceFingerprint)
            }

            this.clearLocalSession()
            this.currentUser = null
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        if (!this.currentUser) {
            await this.initializeSession(); // 尝试从本地存储恢复会话
        }
        try {
            if (this.currentUser) {
                const isValid = await this.validateSession(this.currentUser.id);
                if (isValid) {
                    return this.currentUser;
                } else {
                    this.clearLocalSession();
                    this.currentUser = null;
                }
            }
            return null;
        } catch (error) {
            console.error("Get current user error:", error);
            this.clearLocalSession();
            this.currentUser = null;
            return null;
        }
    }

    private async createSession(userId: string): Promise<void> {
        try {
            const deviceFingerprint = await generateDeviceFingerprint()
            const browserUA = getBrowserUA()
            const ipAddress = await getClientIP()

            // Deactivate old sessions for this device
            await supabase
                .from("user_sessions")
                .update({ is_active: false })
                .eq("user_id", userId)
                .eq("device_fingerprint", deviceFingerprint)

            // Create new session
            await supabase.from("user_sessions").insert({
                user_id: userId,
                browser_ua: browserUA,
                ip_address: ipAddress,
                device_fingerprint: deviceFingerprint,
                login_time: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                is_active: true,
            })
        } catch (error) {
            console.error("Create session error:", error)
        }
    }

    // 新增：清理旧会话
    private async cleanupOldSessions(): Promise<void> {
        try {
            // 清理7天前的非活跃会话
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

            await supabase.from("user_sessions").delete().lt("last_activity", sevenDaysAgo).eq("is_active", false)

            // 将超过1天未活动的会话标记为非活跃
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

            await supabase
                .from("user_sessions")
                .update({ is_active: false })
                .lt("last_activity", oneDayAgo)
                .eq("is_active", true)

            console.log("Old sessions cleaned up")
        } catch (error) {
            console.error("Failed to cleanup old sessions:", error)
        }
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    private validatePassword(password: string): boolean {
        return password.length >= 8
    }

    private validateUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/
        return usernameRegex.test(username)
    }

    isAuthenticated(): boolean {
        return this.currentUser !== null
    }

    getUser(): AuthUser | null {
        return this.currentUser
    }

    // 清理方法，在应用关闭时调用
    destroy(): void {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval)
        }
    }
}

export const authService = new AuthService()

// 在页面卸载时清理
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        authService.destroy()
    })
}
