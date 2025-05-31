<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
        <Icon icon="lucide:trophy" class="w-10 h-10 text-white" />
      </div>
      <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Practice Complete!
      </h2>
      <p class="text-gray-600 text-lg">Here's how you performed in this session</p>
    </div>

    <!-- Overall Performance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Questions -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:file-text" class="w-6 h-6 text-blue-600" />
          </div>
          <span class="text-3xl font-bold text-gray-800">{{ totalQuestions }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Total Questions</h3>
        <p class="text-sm text-gray-600">Questions attempted</p>
      </div>

      <!-- Accuracy -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:target" class="w-6 h-6 text-green-600" />
          </div>
          <span class="text-3xl font-bold text-green-600">{{ accuracy }}%</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Accuracy</h3>
        <p class="text-sm text-gray-600">Overall performance</p>
      </div>

      <!-- Correct Answers -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:check-circle" class="w-6 h-6 text-emerald-600" />
          </div>
          <span class="text-3xl font-bold text-emerald-600">{{ correctAnswers }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Correct</h3>
        <p class="text-sm text-gray-600">Right answers</p>
      </div>

      <!-- Incorrect Answers -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:x-circle" class="w-6 h-6 text-red-600" />
          </div>
          <span class="text-3xl font-bold text-red-600">{{ incorrectAnswers }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Incorrect</h3>
        <p class="text-sm text-gray-600">Wrong answers</p>
      </div>
    </div>

    <!-- Performance Chart -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Icon icon="lucide:bar-chart-3" class="w-6 h-6 mr-3 text-blue-600" />
        Performance Overview
      </h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Accuracy Gauge -->
        <div class="text-center">
          <div class="relative w-48 h-48 mx-auto mb-4">
            <svg class="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none" />
              <!-- Progress circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#gradient)" 
                stroke-width="8" 
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (parseFloat(accuracy) / 100) * circumference"
                class="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-800">{{ accuracy }}%</div>
                <div class="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Performance -->
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
            <h4 class="font-semibold text-lg text-gray-800 mb-4 flex items-center">
              <Icon icon="lucide:clock" class="w-5 h-5 mr-2 text-orange-600" />
              Time Performance
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Time</p>
                <p class="text-2xl font-bold text-gray-800">{{ formattedTotalTime }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Avg. per Question</p>
                <p class="text-2xl font-bold text-gray-800">{{ formattedAvgTimePerQuestion }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center">
              <div class="text-2xl font-bold text-green-600">{{ Math.round(parseFloat(accuracy)) >= 70 ? '🎉' : '💪' }}</div>
              <div class="text-sm font-medium text-gray-700 mt-1">
                {{ Math.round(parseFloat(accuracy)) >= 70 ? 'Great Job!' : 'Keep Going!' }}
              </div>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getPerformanceLevel() }}</div>
              <div class="text-sm font-medium text-gray-700 mt-1">Performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Domain Performance -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Icon icon="lucide:pie-chart" class="w-6 h-6 mr-3 text-purple-600" />
        Topic Performance
      </h3>
      
      <div class="space-y-4">
        <div v-for="domain in Object.values(domainPerformance)" :key="domain.id" 
             class="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-lg text-gray-800">{{ domain.name }}</h4>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-600">
                {{ domain.correct }}/{{ domain.total }}
              </span>
              <span class="text-sm font-bold px-2 py-1 rounded-full"
                    :class="getDomainScoreClass(domain.correct, domain.total)">
                {{ Math.round((domain.correct / domain.total) * 100) }}%
              </span>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="h-3 rounded-full transition-all duration-1000 ease-out"
                 :class="getDomainBarClass(domain.correct, domain.total)"
                 :style="{ width: `${(domain.correct / domain.total) * 100}%` }">
            </div>
          </div>
          
          <!-- Domain Insights -->
          <div class="mt-3 flex items-center text-sm">
            <Icon :icon="getDomainIcon(domain.correct, domain.total)" 
                  :class="getDomainIconClass(domain.correct, domain.total)"
                  class="w-4 h-4 mr-2" />
            <span class="text-gray-600">{{ getDomainFeedback(domain.correct, domain.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        @click="$emit('restart-practice')"
        class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
      >
        <Icon icon="lucide:refresh-cw" class="mr-2 w-5 h-5" />
        Start New Practice
      </button>
      
      <button 
        class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center justify-center"
      >
        <Icon icon="lucide:download" class="mr-2 w-5 h-5" />
        Download Report
      </button>
    </div>

    <!-- Motivational Message -->
    <div class="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
      <h4 class="text-xl font-semibold text-gray-800 mb-2">{{ getMotivationalMessage() }}</h4>
      <p class="text-gray-600">{{ getMotivationalSubtext() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface DomainPerformance {
  id: string
  name: string
  correct: number
  total: number
}

const props = defineProps<{
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  elapsedTime: number
  domainPerformance: Record<string, DomainPerformance>
}>()

defineEmits<{
  'restart-practice': []
}>()

const accuracy = computed(() => {
  return props.totalQuestions > 0
    ? ((props.correctAnswers / props.totalQuestions) * 100).toFixed(1)
    : '0'
})

const circumference = computed(() => 2 * Math.PI * 40)

const formattedTotalTime = computed(() => {
  return formatTime(props.elapsedTime)
})

const formattedAvgTimePerQuestion = computed(() => {
  const avgTime = props.totalQuestions > 0 ? Math.round(props.elapsedTime / props.totalQuestions) : 0
  return formatTime(avgTime)
})

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

const getPerformanceLevel = () => {
  const acc = parseFloat(accuracy.value)
  if (acc >= 90) return 'A+'
  if (acc >= 80) return 'A'
  if (acc >= 70) return 'B+'
  if (acc >= 60) return 'B'
  if (acc >= 50) return 'C'
  return 'D'
}

const getDomainScoreClass = (correct: number, total: number) => {
  const percentage = (correct / total) * 100
  if (percentage >= 80) return 'bg-green-100 text-green-700'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getDomainBarClass = (correct: number, total: number) => {
  const percentage = (correct / total) * 100
  if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500'
  if (percentage >= 60) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
  return 'bg-gradient-to-r from-red-400 to-pink-500'
}

const getDomainIcon = (correct: number, total: number) => {
  const percentage = (correct / total) * 100
  if (percentage >= 80) return 'lucide:trending-up'
  if (percentage >= 60) return 'lucide:minus'
  return 'lucide:trending-down'
}

const getDomainIconClass = (correct: number, total: number) => {
  const percentage = (correct / total) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getDomainFeedback = (correct: number, total: number) => {
  const percentage = (correct / total) * 100
  if (percentage >= 80) return 'Excellent performance! Keep it up.'
  if (percentage >= 60) return 'Good work, room for improvement.'
  return 'Focus on this area for better results.'
}

const getMotivationalMessage = () => {
  const acc = parseFloat(accuracy.value)
  if (acc >= 90) return 'Outstanding Performance! 🌟'
  if (acc >= 80) return 'Excellent Work! 🎯'
  if (acc >= 70) return 'Great Job! 👏'
  if (acc >= 60) return 'Good Progress! 📈'
  return 'Keep Practicing! 💪'
}

const getMotivationalSubtext = () => {
  const acc = parseFloat(accuracy.value)
  if (acc >= 90) return 'You\'re mastering these concepts! Your hard work is paying off.'
  if (acc >= 80) return 'You\'re doing really well! A few more practice sessions and you\'ll be at the top.'
  if (acc >= 70) return 'You\'re on the right track! Focus on your weaker areas to improve further.'
  if (acc >= 60) return 'You\'re making progress! Regular practice will help you improve significantly.'
  return 'Every expert was once a beginner. Keep practicing and you\'ll see improvement!'
}
</script>

<style scoped>
.prose img {
  margin: 1rem auto;
  max-width: 100%;
  height: auto;
}
</style>