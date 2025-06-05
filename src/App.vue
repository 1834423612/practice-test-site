<template>
  <div id="app">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <router-link to="/" class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Icon icon="lucide:graduation-cap" class="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl font-bold text-gray-800">SAT Practice</h1>
                <p class="text-xs text-gray-500">Digital Test Preparation</p>
              </div>
              <div class="block sm:hidden">
                <h1 class="text-xl font-bold text-gray-800">SAT Practice</h1>
                <p class="text-xs text-gray-500">Digital Test Preparation</p>
              </div>
            </router-link>
          </div>

          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link 
              to="/practice" 
              class="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center"
              :class="{ 'text-blue-600 bg-blue-50 rounded-lg': $route.path === '/practice' }"
            >
              <Icon icon="lucide:play-circle" class="w-4 h-4 mr-2" />
              Practice
            </router-link>

            <button
              @click="showWrongQuestions = true"
              class="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 flex items-center relative"
            >
              <Icon icon="lucide:x-circle" class="w-4 h-4 mr-2" />
              Wrong Questions
              <span v-if="wrongQuestionsCount > 0" 
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ wrongQuestionsCount > 99 ? '99+' : wrongQuestionsCount }}
              </span>
            </button>

            <router-link 
              to="/about" 
              class="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center"
              :class="{ 'text-blue-600 bg-blue-50 rounded-lg': $route.path === '/about' }"
            >
              <Icon icon="lucide:info" class="w-4 h-4 mr-2" />
              About
            </router-link>
            
            <!-- 新增：Desktop Contact Link -->
            <router-link 
              to="/contact" 
              class="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center"
              :class="{ 'text-blue-600 bg-blue-50 rounded-lg': $route.path === '/contact' }"
            >
              <Icon icon="lucide:phone" class="w-4 h-4 mr-2" />
              Contact
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center space-x-2">
            <!-- Wrong Questions Button (Mobile) -->
            <button
              @click="showWrongQuestions = true"
              class="p-2 text-gray-700 hover:text-red-600 transition-colors duration-200 relative"
            >
              <Icon icon="lucide:x-circle" class="w-5 h-5" />
              <span v-if="wrongQuestionsCount > 0" 
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ wrongQuestionsCount > 9 ? '9+' : wrongQuestionsCount }}
              </span>
            </button>
    
            <!-- Mobile Menu Toggle -->
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <Icon :icon="showMobileMenu ? 'lucide:x' : 'lucide:menu'" class="w-6 h-6" />
            </button>
          </div>
        </div>
    
        <!-- Mobile Menu -->
        <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
          <div class="flex flex-col space-y-2">
            <router-link 
              to="/practice" 
              @click="showMobileMenu = false"
              class="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200 flex items-center rounded-lg"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/practice' }"
            >
              <Icon icon="lucide:play-circle" class="w-5 h-5 mr-3" />
              Practice
            </router-link>

            <button
              @click="showWrongQuestions = true; showMobileMenu = false"
              class="px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium transition-colors duration-200 flex items-center rounded-lg text-left w-full relative"
            >
              <Icon icon="lucide:x-circle" class="w-5 h-5 mr-3" />
              Wrong Questions
              <span v-if="wrongQuestionsCount > 0" 
                    class="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {{ wrongQuestionsCount > 99 ? '99+' : wrongQuestionsCount }}
              </span>
            </button>

            <router-link 
              to="/about" 
              @click="showMobileMenu = false"
              class="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200 flex items-center rounded-lg"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/about' }"
            >
              <Icon icon="lucide:info" class="w-5 h-5 mr-3" />
              About
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div class="max-w-7xl mx-auto">
      <router-view />
      </div>
    </main>

    <!-- Global Wrong Questions Manager Modal -->
    <div v-if="showWrongQuestions" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
          />
        </div>
      </div>
    </div>

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
import WrongQuestionsManager from './components/WrongQuestionsManager.vue'
import { 
  getWrongQuestions, 
  onWrongQuestionsUpdate, 
  offWrongQuestionsUpdate 
} from './utils/enhancedPracticeUtils'

const router = useRouter()
const route = useRoute()

const wrongQuestionsCount = ref(0)
const showWrongQuestions = ref(false)
const showMobileMenu = ref(false)

// 新增：判断是否为移动端
const isMobile = ref(window.innerWidth < 768)
function handleResize() {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

const updateWrongQuestionsCount = async () => {
  wrongQuestionsCount.value = (await getWrongQuestions()).length
}

const startWrongQuestionsPractice = (questions: any[]) => {
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

const reviewQuestion = (question: any) => {
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

// Initialize wrong questions count
updateWrongQuestionsCount()

// Set up reactive updates
onMounted(() => {
  onWrongQuestionsUpdate(updateWrongQuestionsCount)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  offWrongQuestionsUpdate(updateWrongQuestionsCount)
  window.removeEventListener('resize', handleResize)
})
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
</style>