<template>
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Logo Section -->
                <div class="flex items-center space-x-3 flex-shrink-0">
                    <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div
                            class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Icon icon="lucide:graduation-cap" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">SAT Practice</h1>
                            <p class="text-xs text-gray-500">Digital Test Preparation</p>
                        </div>
                    </router-link>
                </div>

                <!-- Desktop Navigation - Force Display -->
                <div class="flex items-center justify-center flex-1 desktop-nav">
                    <nav class="flex items-center space-x-6">
                        <router-link to="/practice"
                            class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/practice' }">
                            <Icon icon="lucide:play-circle" class="w-4 h-4" />
                            <span>Practice</span>
                        </router-link>

                        <button @click="toggleWrongQuestions"
                            class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium relative"
                            :class="{ 'text-blue-600 bg-blue-50': showWrongQuestions }">
                            <Icon icon="lucide:x-circle" class="w-4 h-4" />
                            <span>Wrong Questions</span>
                            <div v-if="wrongQuestionsCount > 0"
                                class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                                {{ (wrongQuestionsCount > 99) ? '99+' : wrongQuestionsCount }}
                            </div>
                        </button>

                        <router-link to="/about"
                            class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/about' }">
                            <Icon icon="lucide:info" class="w-4 h-4" />
                            <span>About</span>
                        </router-link>

                        <!-- <router-link to="/resources"
                            class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/resources' }">
                            <Icon icon="lucide:book" class="w-4 h-4" />
                            <span>Resources</span>
                        </router-link> -->
                    </nav>
                </div>

                <!-- Desktop User Section -->
                <div class="flex items-center justify-end space-x-4 desktop-nav">
                    <!-- User Menu for Authenticated Users -->
                    <div v-if="authStore.isAuthenticated" class="relative">
                        <button @click="toggleUserMenu"
                            class="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                            :class="{ 'text-blue-600 bg-blue-50': showUserMenu }">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Icon icon="lucide:user" class="w-4 h-4 text-blue-600" />
                            </div>
                            <span class="text-sm font-medium text-gray-700">{{ authStore.username }}</span>
                            <Icon icon="lucide:chevron-down"
                                class="w-4 h-4 text-gray-500 transition-transform duration-200"
                                :class="{ 'rotate-180': showUserMenu }" />
                        </button>

                        <!-- User Dropdown -->
                        <div v-if="showUserMenu"
                            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                            style="animation: slideDown 0.2s ease-out;">
                            <button @click="openProfile"
                                class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200">
                                <Icon icon="lucide:settings" class="w-4 h-4" />
                                <span>Profile & Settings</span>
                            </button>
                            <div class="border-t border-gray-100 my-1"></div>
                            <button @click="handleLogout"
                                class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200">
                                <Icon icon="lucide:log-out" class="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    <!-- Login Button for Non-Authenticated Users -->
                    <button v-else @click="showAuthModal = true"
                        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Icon icon="lucide:log-in" class="w-4 h-4" />
                        <span>Sign In</span>
                    </button>
                </div>

                <div class="mobile-menu flex items-center justify-end space-x-2 md:hidden">
                    <!-- Mobile Wrong Questions -->
                    <button @click="toggleWrongQuestions"
                        class="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Icon icon="lucide:x-circle" class="w-6 h-6" />
                        <div v-if="wrongQuestionsCount > 0"
                            class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                            {{ wrongQuestionsCount > 99 ? '99+' : wrongQuestionsCount }}
                        </div>
                    </button>

                    <!-- Mobile Menu Button -->
                    <button @click="toggleMobileMenu"
                        class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Icon :icon="showMobileMenu ? 'lucide:x' : 'lucide:menu'" class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div v-if="showMobileMenu" class="mobile-menu border-t border-gray-200 py-4 space-y-2">
                <router-link to="/practice" @click="closeMobileMenu"
                    class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                    :class="{ 'text-blue-600 bg-blue-50': $route.path === '/practice' }">
                    <Icon icon="lucide:play-circle" class="w-5 h-5" />
                    <span>Practice</span>
                </router-link>

                <button @click="openWrongQuestionsFromMobile"
                    class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
                    <Icon icon="lucide:x-circle" class="w-5 h-5" />
                    <span>Wrong Questions</span>
                    <div v-if="wrongQuestionsCount > 0"
                        class="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full min-w-[24px] text-center">
                        {{ (wrongQuestionsCount > 99) ? '99+' : wrongQuestionsCount }}
                    </div>
                </button>

                <router-link to="/about" @click="closeMobileMenu"
                    class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                    :class="{ 'text-blue-600 bg-blue-50': $route.path === '/about' }">
                    <Icon icon="lucide:info" class="w-5 h-5" />
                    <span>About</span>
                </router-link>

                <!-- <router-link to="/resources" @click="closeMobileMenu"
                    class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                    :class="{ 'text-blue-600 bg-blue-50': $route.path === '/resources' }">
                    <Icon icon="lucide:book" class="w-5 h-5" />
                    <span>Resources</span>
                </router-link> -->

                <!-- Mobile User Section -->
                <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    <div class="px-4 py-2 flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon icon="lucide:user" class="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ authStore.username }}</p>
                            <p class="text-xs text-gray-500">{{ authStore.currentUser?.email }}</p>
                        </div>
                    </div>

                    <button @click="openProfileFromMobile"
                        class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
                        <Icon icon="lucide:settings" class="w-5 h-5" />
                        <span>Profile & Settings</span>
                    </button>

                    <button @click="handleLogout"
                        class="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium">
                        <Icon icon="lucide:log-out" class="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>

                <!-- Mobile Login Button -->
                <div v-else class="border-t border-gray-200 pt-4 mt-4">
                    <button @click="openAuthFromMobile"
                        class="w-full mx-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                        <Icon icon="lucide:log-in" class="w-5 h-5" />
                        <span>Sign In</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Modals -->
    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" @success="handleAuthSuccess" />

    <div v-if="showProfileModal"
        class="fixed inset-0 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">User Profile</h3>
                <button @click="showProfileModal = false"
                    class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                    <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
            </div>
            <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <UserProfile v-if="authStore.currentUser" :user="authStore.currentUser" @logout="handleLogout" />
            </div>
        </div>
    </div>

    <div v-if="showWrongQuestions"
        class="fixed inset-0 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">Wrong Questions Manager</h3>
                <button @click="showWrongQuestions = false"
                    class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                    <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
            </div>
            <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
                <WrongQuestionsManager :isInPracticeMode="false"
                    @start-wrong-questions-practice="handleStartWrongQuestionsPractice"
                    @review-question="handleReviewQuestion" @show-auth="openAuthFromWrongQuestions" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import AuthModal from './AuthModal.vue'
import UserProfile from './UserProfile.vue'
import WrongQuestionsManager from './WrongQuestionsManager.vue'
import { getWrongQuestions, onWrongQuestionsUpdate, offWrongQuestionsUpdate } from '@/utils/enhancedPracticeUtils'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const showAuthModal = ref(false)
const showProfileModal = ref(false)
const showWrongQuestions = ref(false)
const wrongQuestionsCount = ref(0)

// Load wrong questions count
const updateWrongQuestionsCount = async () => {
    try {
        const questions = await getWrongQuestions()
        wrongQuestionsCount.value = questions.length
    } catch (error) {
        console.error('Failed to update wrong questions count:', error)
        wrongQuestionsCount.value = 0
    }
}

// Navigation handlers
const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
    if (showMobileMenu.value) {
        showUserMenu.value = false
    }
}

const closeMobileMenu = () => {
    showMobileMenu.value = false
}

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
    if (showUserMenu.value) {
        showMobileMenu.value = false
    }
}

const closeUserMenu = () => {
    showUserMenu.value = false
}

const toggleWrongQuestions = () => {
    showWrongQuestions.value = !showWrongQuestions.value
    closeAllMenus()
}

const closeAllMenus = () => {
    showMobileMenu.value = false
    showUserMenu.value = false
}

// Modal handlers
const openProfile = () => {
    showProfileModal.value = true
    closeUserMenu()
}

const openProfileFromMobile = () => {
    showProfileModal.value = true
    closeMobileMenu()
}

const openAuthFromMobile = () => {
    showAuthModal.value = true
    closeMobileMenu()
}

const openWrongQuestionsFromMobile = () => {
    showWrongQuestions.value = true
    closeMobileMenu()
}

const openAuthFromWrongQuestions = () => {
    showAuthModal.value = true
    showWrongQuestions.value = false
}

// Auth handlers
const handleAuthSuccess = (user: any) => {
    authStore.updateUser(user)
    showAuthModal.value = false
    closeAllMenus()
}

const handleLogout = async () => {
    const result = await authStore.logout()
    if (result.success) {
        showProfileModal.value = false
        closeAllMenus()
    } else {
        console.error('Logout failed:', result.error)
    }
}

// Practice handlers
const handleStartWrongQuestionsPractice = (questions: any[]) => {
    showWrongQuestions.value = false
    const queryObj = {
        mode: 'wrong-questions',
        questions: JSON.stringify(questions.map(q => q.external_id))
    }

    if (route.path === '/practice') {
        router.replace({ path: '/practice', query: queryObj })
    } else {
        router.push({ path: '/practice', query: queryObj })
    }
}

const handleReviewQuestion = (question: any) => {
    showWrongQuestions.value = false
    const queryObj = {
        mode: 'review',
        questionId: question.external_id
    }

    if (route.path === '/practice') {
        router.replace({ path: '/practice', query: queryObj })
    } else {
        router.push({ path: '/practice', query: queryObj })
    }
}

// Click outside handler
const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement

    // Close user menu if clicking outside
    if (!target.closest('.relative') && showUserMenu.value) {
        showUserMenu.value = false
    }
}

// Lifecycle
onMounted(async () => {
    await authStore.initialize()
    await updateWrongQuestionsCount()
    onWrongQuestionsUpdate(updateWrongQuestionsCount)
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    offWrongQuestionsUpdate(updateWrongQuestionsCount)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('click', handleClickOutside);
})
</script>

<style scoped>
/* Desktop Navigation - Show on medium screens and up */
.desktop-nav {
    display: none;
}

@media (min-width: 768px) {
    .desktop-nav {
        display: flex;
    }
}

/* Mobile Menu - Show only on small screens */
.mobile-menu-btn {
    display: block;
}

.mobile-menu {
    display: block;
}

@media (min-width: 768px) {
    .mobile-menu-btn {
        display: none;
    }

    .mobile-menu {
        display: none;
    }
}

/* Animations */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Ensure proper spacing */
.flex-1 {
    flex: 1 1 0%;
}

/* Mobile styles */
@media (max-width: 767px) {
    header {
        font-size: 0.875rem; /* 基础字体缩小 */
    }

    .flex.items-center.justify-between.h-16 {
        height: 3.5rem; /* 减小顶部高度 */
    }

    .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem; /* 缩小左右内边距 */
    }

    .mobile-menu {
        padding: 0.5rem 1rem; /* 调整手机菜单内边距 */
    }

    .text-xl {
        font-size: 1.125rem; /* 根据需要减小标题字体 */
    }

    button {
        padding: 0.5rem 0.75rem; /* 缩小按钮内边距 */
    }
}
</style>
