import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { authService, type AuthUser } from "@/utils/auth"

export const useAuthStore = defineStore("auth", () => {
    // 状态
    const currentUser = ref<AuthUser | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性
    const isAuthenticated = computed(() => !!currentUser.value)
    const username = computed(() => currentUser.value?.username || "")

    // 初始化函数 - 在应用启动时调用
    async function initialize() {
        isLoading.value = true
        error.value = null

        try {
            currentUser.value = await authService.getCurrentUser()
            console.log("Auth store initialized, user:", currentUser.value?.username || "none")
        } catch (err) {
            console.error("Failed to initialize auth store:", err)
            error.value = "Failed to load user data"
            currentUser.value = null
        } finally {
            isLoading.value = false
        }
    }

    // 登录
    async function login(credentials: { email: string; password: string }) {
        isLoading.value = true
        error.value = null

        try {
            const response = await authService.login(credentials)

            if (response.success && response.user) {
                currentUser.value = response.user
                return { success: true }
            } else {
                error.value = response.error || "Login failed"
                return { success: false, error: error.value }
            }
        } catch (err) {
            console.error("Login error:", err)
            error.value = "An unexpected error occurred"
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 注册
    async function register(credentials: { username: string; email: string; password: string }) {
        isLoading.value = true
        error.value = null

        try {
            const response = await authService.register(credentials)

            if (response.success && response.user) {
                currentUser.value = response.user
                return { success: true }
            } else {
                error.value = response.error || "Registration failed"
                return { success: false, error: error.value }
            }
        } catch (err) {
            console.error("Registration error:", err)
            error.value = "An unexpected error occurred"
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 登出
    async function logout() {
        isLoading.value = true

        try {
            await authService.logout()
            currentUser.value = null
            return { success: true }
        } catch (err) {
            console.error("Logout error:", err)
            error.value = "Failed to logout"
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 更新用户信息
    function updateUser(user: AuthUser) {
        currentUser.value = user
    }

    return {
        currentUser,
        isLoading,
        error,
        isAuthenticated,
        username,
        initialize,
        login,
        register,
        logout,
        updateUser,
    }
})
