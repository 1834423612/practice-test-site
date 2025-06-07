<template>
  <div id="app">
    <!-- Navigation Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div class="max-w-7xl mx-auto">
        <router-view />
      </div>
    </main>

    <!-- Auth Modal -->
    <AuthModal
      v-if="showAuth"
      @close="showAuth = false"
      @success="handleAuthSuccess"
    />

    <!-- User Profile Modal -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-xl font-semibold text-gray-800">User Profile</h3>
              <button
                @click="showProfile = false"
                class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Icon icon="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <UserProfile
                v-if="user"
                :user="user"
                @logout="handleLogout"
              />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Global Wrong Questions Manager Modal -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showWrongQuestions" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-xl font-semibold text-gray-800">Wrong Questions Manager</h3>
              <button
                @click="showWrongQuestions = false"
                class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Icon icon="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
              <WrongQuestionsManager
                :isInPracticeMode="false"
                @start-wrong-questions-practice="startWrongQuestionsPractice"
                @review-question="reviewQuestion"
                @show-auth="openAuthFromWrongQuestions"
              />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 text-sm">
            © 2024 SAT Practice Platform. Built for digital test preparation.
          </p>
          <div class="mt-4 flex justify-center space-x-6">
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Icon icon="lucide:github" class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Icon icon="lucide:twitter" class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Icon icon="lucide:mail" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppHeader from './components/AppHeader.vue'
import AuthModal from './components/AuthModal.vue'
import UserProfile from './components/UserProfile.vue'
import WrongQuestionsManager from './components/WrongQuestionsManager.vue'
import { 
  getWrongQuestions, 
  onWrongQuestionsUpdate, 
  offWrongQuestionsUpdate 
} from './utils/enhancedPracticeUtils'
import { authService, type AuthUser } from './utils/auth'

const router = useRouter()
const route = useRoute()

// Refs
const user = ref<AuthUser | null>(null)
const wrongQuestionsCount = ref(0)
const showWrongQuestions = ref(false)
const showMobileMenu = ref(false)
const showAuth = ref(false)
const showProfile = ref(false)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

// Methods
const updateWrongQuestionsCount = async (): Promise<void> => {
  try {
    const questions = await getWrongQuestions()
    wrongQuestionsCount.value = questions.length
  } catch (error) {
    console.error('Failed to update wrong questions count:', error)
    wrongQuestionsCount.value = 0
  }
}

const loadUser = async (): Promise<void> => {
  try {
    user.value = await authService.getCurrentUser()
  } catch (error) {
    console.error('Failed to load user:', error)
    user.value = null
  }
}

const handleAuthSuccess = (authUser: AuthUser): void => {
  user.value = authUser
  showAuth.value = false
}

const handleLogout = async (): Promise<void> => {
  try {
    await authService.logout()
    user.value = null
    showProfile.value = false
    showUserMenu.value = false
    showMobileMenu.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Menu toggle methods
// const toggleUserMenu = (): void => {
//   showUserMenu.value = !showUserMenu.value
// }

// const toggleMobileMenu = (): void => {
//   showMobileMenu.value = !showMobileMenu.value
// }

// const closeMobileMenu = (): void => {
//   showMobileMenu.value = false
// }

// // Modal opening methods
// const openProfile = (): void => {
//   showProfile.value = true
//   showUserMenu.value = false
// }

// const openProfileFromMobile = (): void => {
//   showProfile.value = true
//   showMobileMenu.value = false
// }

// const openAuthFromMobile = (): void => {
//   showAuth.value = true
//   showMobileMenu.value = false
// }

const openAuthFromWrongQuestions = (): void => {
  showAuth.value = true
  showWrongQuestions.value = false
}

// const openWrongQuestionsFromMobile = (): void => {
//   showWrongQuestions.value = true
//   showMobileMenu.value = false
// }

// Navigation methods
const startWrongQuestionsPractice = (questions: any[]): void => {
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

const reviewQuestion = (question: any): void => {
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
const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  
  // Close user menu if clicking outside
  if (userMenuRef.value && !userMenuRef.value.contains(target)) {
    showUserMenu.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadUser()
  await updateWrongQuestionsCount()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  offWrongQuestionsUpdate(updateWrongQuestionsCount)
  document.removeEventListener('click', handleClickOutside)
  
})

onWrongQuestionsUpdate(updateWrongQuestionsCount)
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.router-link-active {
  color: #3b82f6;
}

/* Custom transitions */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
