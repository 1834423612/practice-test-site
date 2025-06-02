<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">SAT Practice</h1>
          </div>
          <div class="flex items-center gap-4">
            <div v-if="isAuthenticated" class="flex items-center gap-4">
              <span class="text-sm text-gray-600">Welcome, {{ user?.full_name || user?.email }}</span>
              <button
                @click="handleSignOut"
                class="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
            <div v-else>
              <button
                @click="showAuthModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-80"></div>
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-400"></div>
      </div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master the SAT with <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personalized Practice</span>
          </h1>
          <p class="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            Improve your scores with our adaptive practice platform designed for the digital SAT format.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/practice" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Start Practicing
            </router-link>
            <a href="#features" class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 sm:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Designed for Success</h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Our platform offers comprehensive features to help you excel on test day.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
              <BookOpenIcon class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Official Questions</h3>
            <p class="text-gray-600">
              Practice with 1,000+ official College Board questions from real SAT exams.
            </p>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
              <BarChart3Icon class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Performance Analytics</h3>
            <p class="text-gray-600">
              Track your progress with detailed analytics and personalized recommendations.
            </p>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
              <CloudIcon class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Cloud Sync</h3>
            <p class="text-gray-600">
              Access your practice history and wrong questions across all your devices.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section (for authenticated users) -->
    <section v-if="isAuthenticated" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <p class="text-lg text-gray-600">Keep track of your improvement over time</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-2xl font-bold text-blue-600 mb-2">{{ stats.totalSessions }}</div>
            <div class="text-sm text-gray-600">Practice Sessions</div>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-2xl font-bold text-green-600 mb-2">{{ stats.totalQuestions }}</div>
            <div class="text-sm text-gray-600">Questions Answered</div>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-2xl font-bold text-purple-600 mb-2">{{ stats.averageAccuracy }}%</div>
            <div class="text-sm text-gray-600">Average Accuracy</div>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-2xl font-bold text-orange-600 mb-2">{{ stats.wrongQuestions }}</div>
            <div class="text-sm text-gray-600">Questions to Review</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 sm:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Our simple process helps you focus on what matters most - improving your score.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-xl font-bold text-white">1</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Choose Your Focus</h3>
            <p class="text-gray-600">
              Select the exam type and specific sections you want to practice.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-xl font-bold text-white">2</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Practice Questions</h3>
            <p class="text-gray-600">
              Answer questions in a realistic digital SAT environment.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-xl font-bold text-white">3</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Get Instant Feedback</h3>
            <p class="text-gray-600">
              Review detailed explanations for each question you answer.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-xl font-bold text-white">4</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p class="text-gray-600">
              Monitor your improvement over time with detailed analytics.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-6">Ready to Improve Your SAT Score?</h2>
        <p class="text-xl mb-8 opacity-90">
          Join thousands of students who have improved their scores with our platform.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link to="/practice" class="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300">
            Start Free Practice
          </router-link>
          <router-link to="/wrong-questions" class="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-300">
            Review Wrong Questions
          </router-link>
        </div>
      </div>
    </section>

    <!-- Auth Modal -->
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" @success="handleAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BookOpenIcon, BarChart3Icon, CloudIcon } from 'lucide-vue-next'
import { isAuthenticated, user, signOut, initAuth } from '../utils/auth'
import { getPracticeResults, getWrongQuestions } from '../utils/enhancedPracticeUtils'
import AuthModal from '../components/AuthModal.vue'

// Reactive data
const showAuthModal = ref(false)
const stats = ref({
  totalSessions: 0,
  totalQuestions: 0,
  averageAccuracy: 0,
  wrongQuestions: 0
})

// Methods
const handleSignOut = async () => {
  await signOut()
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
  loadUserStats()
}

const loadUserStats = async () => {
  if (!isAuthenticated.value) return

  try {
    const [practiceResults, wrongQuestions] = await Promise.all([
      getPracticeResults(),
      getWrongQuestions()
    ])

    stats.value = {
      totalSessions: practiceResults.length,
      totalQuestions: practiceResults.reduce((sum, session) => sum + session.total_questions, 0),
      averageAccuracy: practiceResults.length > 0 
        ? Math.round(practiceResults.reduce((sum, session) => sum + session.accuracy, 0) / practiceResults.length)
        : 0,
      wrongQuestions: wrongQuestions.length
    }
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await initAuth()
  if (isAuthenticated.value) {
    loadUserStats()
  }
})
</script>
