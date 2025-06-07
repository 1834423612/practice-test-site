<template>
    <div class="p-3 sm:p-6 max-w-4xl mx-auto">
        <!-- User Info Section -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div class="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto mb-4">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="lucide:user" class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                    <h2 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">{{ user.username }}</h2>
                    <p class="text-sm sm:text-base text-gray-600 truncate">{{ user.email }}</p>
                    <p class="text-xs sm:text-sm text-gray-500">
                        Member since {{ formatDate(new Date(user.created_at).getTime()) }}
                    </p>
                </div>
            </div>
            <button @click="handleLogout"
                class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base">
                <Icon icon="lucide:log-out" class="w-4 h-4 mr-2" />
                Logout
            </button>
        </div>

        <!-- Current Device Info -->
        <div class="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div class="flex items-center justify-between mb-2 sm:mb-3">
                <h3 class="font-semibold text-blue-800 flex items-center text-sm sm:text-base">
                    <Icon icon="lucide:smartphone" class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Current Device
                </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div class="min-w-0">
                    <p class="text-blue-700 font-medium">Browser</p>
                    <p class="text-blue-600 truncate">{{ currentDevice.browser }}</p>
                </div>
                <div class="min-w-0">
                    <p class="text-blue-700 font-medium">Platform</p>
                    <p class="text-blue-600 truncate">{{ currentDevice.platform }}</p>
                </div>
                <div class="min-w-0">
                    <p class="text-blue-700 font-medium">Screen Resolution</p>
                    <p class="text-blue-600 truncate">{{ currentDevice.screen }}</p>
                </div>
                <div class="min-w-0">
                    <p class="text-blue-700 font-medium">Timezone</p>
                    <p class="text-blue-600 truncate">{{ currentDevice.timezone }}</p>
                </div>
            </div>

            <!-- Debug info (remove in production) -->
            <div v-if="showDebugInfo" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Current Fingerprint: {{ currentDeviceFingerprint.slice(0, 16) }}...</p>
                <p>Sessions Count: {{ sessions.length }}</p>
                <p v-for="(session, index) in sessions" :key="session.id">
                    Session {{ index + 1 }}: {{ session.device_fingerprint.slice(0, 16) }}... 
                    {{ isCurrentSession(session) ? '(CURRENT)' : '' }}
                </p>
            </div>
        </div>

        <!-- Active Sessions -->
        <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                    <Icon icon="lucide:monitor" class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Active Sessions
                </h3>
                <div class="flex items-center space-x-2">
                    <button @click="loadSessions" :disabled="loadingSessions"
                        class="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center">
                        <Icon :icon="loadingSessions ? 'lucide:loader-2' : 'lucide:refresh-cw'"
                            :class="loadingSessions ? 'animate-spin' : ''" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Refresh
                    </button>
                    <!-- <button @click="toggleDebugInfo"
                        class="text-gray-500 hover:text-gray-700 text-xs font-medium">
                        Debug
                    </button> -->
                </div>
            </div>

            <div v-if="loadingSessions" class="text-center py-3 sm:py-4">
                <Icon icon="lucide:loader-2" class="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto text-gray-400" />
                <p class="text-gray-500 mt-2 text-xs sm:text-sm">Loading sessions...</p>
            </div>

            <div v-else-if="sessions.length === 0" class="text-center py-3 sm:py-4">
                <Icon icon="lucide:monitor-off" class="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-gray-400 mb-2" />
                <p class="text-gray-500 text-xs sm:text-sm">No active sessions found</p>
            </div>

            <div v-else class="space-y-2 sm:space-y-3">
                <div v-for="session in sessions" :key="session.id"
                    class="bg-white rounded-lg p-2 sm:p-3 border border-gray-200"
                    :class="{ 'ring-1 sm:ring-2 ring-blue-500': isCurrentSession(session) }">
                    <div class="flex items-start justify-between space-x-2">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <Icon :icon="getDeviceIcon(session.browser_ua)" class="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span class="font-medium text-gray-800 text-xs sm:text-sm truncate">
                                    {{ getBrowserName(session.browser_ua) }}
                                </span>
                                <span v-if="isCurrentSession(session)"
                                    class="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0">
                                    Current
                                </span>
                            </div>
                            <div class="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                                <p class="truncate">{{ getPlatformName(session.browser_ua) }}</p>
                                <p class="truncate">IP: {{ session.ip_address }}</p>
                                <p class="truncate">Last active: {{ formatRelativeTime(session.last_activity) }}</p>
                                <p class="truncate">Login: {{ formatDate(new Date(session.login_time).getTime()) }}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <div class="flex items-center space-x-1">
                                <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                                <span class="text-xs text-green-600">Active</span>
                            </div>
                            <button v-if="!isCurrentSession(session)" @click="terminateSession(session.id)"
                                :disabled="terminatingSession === session.id"
                                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Terminate session">
                                <Icon :icon="terminatingSession === session.id ? 'lucide:loader-2' : 'lucide:trash-2'"
                                    :class="terminatingSession === session.id ? 'animate-spin' : ''" class="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div class="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ stats.totalQuestions }}</div>
                <div class="text-xs sm:text-sm text-gray-600">Questions Attempted</div>
            </div>

            <div class="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                <div class="text-xl sm:text-2xl font-bold text-red-600">{{ stats.wrongQuestions }}</div>
                <div class="text-xs sm:text-sm text-gray-600">Wrong Questions</div>
            </div>

            <div class="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                <div class="text-xl sm:text-2xl font-bold text-green-600">{{ stats.accuracy }}%</div>
                <div class="text-xs sm:text-sm text-gray-600">Overall Accuracy</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { authService, type AuthUser } from '@/utils/auth'
import { getWrongQuestions, getQuestionProgress } from '@/utils/enhancedPracticeUtils'
import { supabase, type UserSession } from '@/lib/supabase'
import { generateDeviceFingerprint } from '@/utils/deviceUtils'

const props = defineProps<{
    user: AuthUser
}>()

const emit = defineEmits<{
    logout: []
}>()

const sessions = ref<UserSession[]>([])
const loadingSessions = ref(false)
const terminatingSession = ref<string | null>(null)
const currentDeviceFingerprint = ref<string>('')
const showDebugInfo = ref(false)

const currentDevice = reactive({
    browser: '',
    platform: '',
    screen: '',
    timezone: ''
})

const stats = reactive({
    totalQuestions: 0,
    wrongQuestions: 0,
    accuracy: 0
})

const handleLogout = async () => {
    await authService.logout()
    emit('logout')
}

const loadCurrentDeviceInfo = async () => {
    try {
        console.log('Loading current device info...')
        
        // 确保DOM已经完全加载
        await nextTick()
        
        // 生成设备指纹
        currentDeviceFingerprint.value = await generateDeviceFingerprint()
        console.log('Generated device fingerprint:', currentDeviceFingerprint.value.slice(0, 16) + '...')

        // Get browser info
        const userAgent = navigator.userAgent
        currentDevice.browser = getBrowserName(userAgent)
        currentDevice.platform = getPlatformName(userAgent)
        currentDevice.screen = `${screen.width}x${screen.height}`
        currentDevice.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        
        console.log('Device info loaded:', {
            browser: currentDevice.browser,
            platform: currentDevice.platform,
            screen: currentDevice.screen,
            timezone: currentDevice.timezone
        })
    } catch (error) {
        console.error('Failed to load device info:', error)
    }
}

const loadSessions = async () => {
    loadingSessions.value = true
    try {
        console.log('Loading sessions for user:', props.user.id)
        
        const { data, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', props.user.id)
            .eq('is_active', true)
            .order('last_activity', { ascending: false })

        if (error) throw error
        
        sessions.value = data || []
        console.log('Loaded sessions:', sessions.value.length)
        
        // 检查当前会话匹配
        if (currentDeviceFingerprint.value) {
            const currentSession = sessions.value.find(s => s.device_fingerprint === currentDeviceFingerprint.value)
            console.log('Current session found:', !!currentSession)
            if (currentSession) {
                console.log('Current session details:', {
                    id: currentSession.id,
                    fingerprint: currentSession.device_fingerprint.slice(0, 16) + '...',
                    browser: currentSession.browser_ua.slice(0, 50) + '...',
                    lastActivity: currentSession.last_activity
                })
            }
        }
    } catch (error) {
        console.error('Failed to load sessions:', error)
        sessions.value = []
    } finally {
        loadingSessions.value = false
    }
}

const terminateSession = async (sessionId: string) => {
    terminatingSession.value = sessionId
    try {
        const { error } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('id', sessionId)

        if (error) throw error

        // Remove from local list
        sessions.value = sessions.value.filter(s => s.id !== sessionId)
    } catch (error) {
        console.error('Failed to terminate session:', error)
        alert('Failed to terminate session. Please try again.')
    } finally {
        terminatingSession.value = null
    }
}

const isCurrentSession = (session: UserSession): boolean => {
    const isCurrent = session.device_fingerprint === currentDeviceFingerprint.value
    if (showDebugInfo.value) {
        console.log('Checking session:', {
            sessionFingerprint: session.device_fingerprint.slice(0, 16) + '...',
            currentFingerprint: currentDeviceFingerprint.value.slice(0, 16) + '...',
            isCurrent
        })
    }
    return isCurrent
}

// const toggleDebugInfo = () => {
//     showDebugInfo.value = !showDebugInfo.value
//     console.log('Debug info toggled:', showDebugInfo.value)
// }

const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('Opera')) return 'Opera'
    return 'Unknown Browser'
}

const getPlatformName = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
    return 'Unknown Platform'
}

const getDeviceIcon = (userAgent: string): string => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        return 'lucide:smartphone'
    }
    if (userAgent.includes('iPad')) {
        return 'lucide:tablet'
    }
    return 'lucide:monitor'
}

const loadStats = async () => {
    try {
        const wrongQuestions = await getWrongQuestions()
        const progress = await getQuestionProgress()

        const totalAnswered = Object.keys(progress).length
        const correctAnswers = Object.values(progress).filter(p => p.isCorrect).length

        stats.totalQuestions = totalAnswered
        stats.wrongQuestions = wrongQuestions.length
        stats.accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    return formatDate(date.getTime())
}

onMounted(async () => {
    console.log('UserProfile mounted, loading data...')
    
    // 确保按正确顺序加载
    await loadCurrentDeviceInfo()
    await loadSessions()
    await loadStats()
    
    console.log('UserProfile data loading completed')
})
</script>
