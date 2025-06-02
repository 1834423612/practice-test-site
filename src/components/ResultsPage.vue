<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header with Animation -->
    <div class="text-center">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse-slow">
        <Icon icon="lucide:trophy" class="w-12 h-12 text-white" />
      </div>
      <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
        Practice Complete!
      </h2>
      <p class="text-gray-600 text-lg max-w-2xl mx-auto">
        Great job on completing your practice session. Here's a detailed breakdown of your performance.
      </p>
    </div>

    <!-- Overall Performance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Questions -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:translate-y-[-5px]">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:file-text" class="w-7 h-7 text-blue-600" />
          </div>
          <span class="text-4xl font-bold text-gray-800">{{ totalQuestions }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Total Questions</h3>
        <p class="text-sm text-gray-600">Questions attempted</p>
      </div>

      <!-- Accuracy -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:translate-y-[-5px]">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:target" class="w-7 h-7 text-green-600" />
          </div>
          <span class="text-4xl font-bold text-green-600">{{ accuracy }}%</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Accuracy</h3>
        <p class="text-sm text-gray-600">Overall performance</p>
      </div>

      <!-- Correct Answers -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:translate-y-[-5px]">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:check-circle" class="w-7 h-7 text-emerald-600" />
          </div>
          <span class="text-4xl font-bold text-emerald-600">{{ correctAnswers }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Correct</h3>
        <p class="text-sm text-gray-600">Right answers</p>
      </div>

      <!-- Incorrect Answers -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:translate-y-[-5px]">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
            <Icon icon="lucide:x-circle" class="w-7 h-7 text-red-600" />
          </div>
          <span class="text-4xl font-bold text-red-600">{{ incorrectAnswers }}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">Incorrect</h3>
        <p class="text-sm text-gray-600">Wrong answers</p>
      </div>
    </div>

    <!-- Performance Chart -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Icon icon="lucide:bar-chart-3" class="w-6 h-6 mr-3 text-blue-600" />
        Performance Overview
      </h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Accuracy Gauge -->
        <div class="text-center">
          <div class="relative w-56 h-56 mx-auto mb-4">
            <svg class="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none" />
              <!-- Progress circle with animation -->
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
                class="transition-all duration-1500 ease-out"
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
                <div class="text-4xl font-bold text-gray-800">{{ accuracy }}%</div>
                <div class="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
          <div class="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <span class="font-semibold text-gray-800">{{ getPerformanceLevel() }}</span>
          </div>
        </div>

        <!-- Time Performance -->
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 shadow-sm">
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
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 text-center shadow-sm">
              <div class="text-3xl font-bold text-green-600">{{ Math.round(parseFloat(accuracy)) >= 70 ? '🎉' : '💪' }}</div>
              <div class="text-sm font-medium text-gray-700 mt-2">
                {{ Math.round(parseFloat(accuracy)) >= 70 ? 'Great Job!' : 'Keep Going!' }}
              </div>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200 text-center shadow-sm">
              <div class="text-3xl font-bold text-blue-600">{{ getLetterGrade() }}</div>
              <div class="text-sm font-medium text-gray-700 mt-2">Performance Grade</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Domain Performance -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Icon icon="lucide:pie-chart" class="w-6 h-6 mr-3 text-purple-600" />
        Topic Performance
      </h3>
      
      <div v-if="!domainPerformance || Object.keys(domainPerformance).length === 0" class="text-center py-8">
        <Icon icon="lucide:info" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No topic performance data available</p>
      </div>
      
      <div v-else class="space-y-5">
        <div v-for="domain in validDomains" :key="domain.id" 
             class="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <h4 class="font-semibold text-lg text-gray-800">
              {{ formatDomainName(domain.name, domain.id) }}
            </h4>
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-600">
                {{ domain.correct || 0 }}/{{ domain.total || 0 }}
              </span>
              <span class="text-sm font-bold px-3 py-1 rounded-full"
                    :class="getDomainScoreClass(domain.correct || 0, domain.total || 1)">
                {{ domain.total > 0 ? Math.round(((domain.correct || 0) / domain.total) * 100) : 0 }}%
              </span>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="h-3 rounded-full transition-all duration-1000 ease-out"
                 :class="getDomainBarClass(domain.correct || 0, domain.total || 1)"
                 :style="{ width: `${domain.total > 0 ? ((domain.correct || 0) / domain.total) * 100 : 0}%` }">
            </div>
          </div>
          
          <!-- Domain Insights -->
          <div class="mt-3 flex items-center text-sm">
            <Icon :icon="getDomainIcon(domain.correct || 0, domain.total || 1)" 
                  :class="getDomainIconClass(domain.correct || 0, domain.total || 1)"
                  class="w-4 h-4 mr-2" />
            <span class="text-gray-600">{{ getDomainFeedback(domain.correct || 0, domain.total || 1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <Icon icon="lucide:lightbulb" class="w-6 h-6 mr-3 text-yellow-500" />
        Recommendations
      </h3>
      
      <ul class="space-y-3 mt-4">
        <li v-for="(recommendation, index) in getRecommendations()" :key="index" 
            class="flex items-start">
          <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
            <span class="text-blue-600 text-xs font-bold">{{ index + 1 }}</span>
          </div>
          <p class="text-gray-700">{{ recommendation }}</p>
        </li>
      </ul>
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
        @click="downloadReport"
        class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center justify-center"
      >
        <Icon icon="lucide:download" class="mr-2 w-5 h-5" />
        Download Report
      </button>
    </div>

    <!-- Motivational Message -->
    <div class="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
      <h4 class="text-xl font-semibold text-gray-800 mb-3">{{ getMotivationalMessage() }}</h4>
      <p class="text-gray-600 max-w-2xl mx-auto">{{ getMotivationalSubtext() }}</p>
    </div>

    <!-- Debug Info (temporary) -->
    <div v-if="showDebug" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs">
      <p><strong>Debug Info:</strong></p>
      <p>Domain Performance Keys: {{ Object.keys(domainPerformance || {}) }}</p>
      <p>Domain Performance Values: {{ JSON.stringify(domainPerformance, null, 2) }}</p>
      <p>Valid Domains Count: {{ validDomains.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

// Automatically enable debug mode only in development environment
const showDebug = ref(import.meta.env.DEV)

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

// 创建一个计算属性来过滤和验证域数据
const validDomains = computed(() => {
  if (!props.domainPerformance || typeof props.domainPerformance !== 'object') {
    console.warn('domainPerformance is not a valid object:', props.domainPerformance)
    return []
  }

  return Object.values(props.domainPerformance).filter(domain => {
    // 确保域对象有必要的属性
    if (!domain || typeof domain !== 'object') {
      console.warn('Invalid domain object:', domain)
      return false
    }

    // 确保有ID
    if (!domain.id) {
      console.warn('Domain missing id:', domain)
      return false
    }

    return true
  }).map(domain => {
    // 确保所有属性都有默认值
    return {
      id: String(domain.id || ''),
      name: String(domain.name || domain.id || ''),
      correct: Number(domain.correct || 0),
      total: Number(domain.total || 0)
    }
  })
})

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
  if (acc >= 90) return 'Excellent'
  if (acc >= 80) return 'Very Good'
  if (acc >= 70) return 'Good'
  if (acc >= 60) return 'Fair'
  return 'Needs Improvement'
}

const getLetterGrade = () => {
  const acc = parseFloat(accuracy.value)
  if (acc >= 90) return 'A+'
  if (acc >= 85) return 'A'
  if (acc >= 80) return 'A-'
  if (acc >= 75) return 'B+'
  if (acc >= 70) return 'B'
  if (acc >= 65) return 'B-'
  if (acc >= 60) return 'C+'
  if (acc >= 55) return 'C'
  if (acc >= 50) return 'C-'
  return 'D'
}

const getDomainScoreClass = (correct: number, total: number) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0
  if (percentage >= 80) return 'bg-green-100 text-green-700'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getDomainBarClass = (correct: number, total: number) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0
  if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500'
  if (percentage >= 60) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
  return 'bg-gradient-to-r from-red-400 to-pink-500'
}

const getDomainIcon = (correct: number, total: number) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0
  if (percentage >= 80) return 'lucide:trending-up'
  if (percentage >= 60) return 'lucide:minus'
  return 'lucide:trending-down'
}

const getDomainIconClass = (correct: number, total: number) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getDomainFeedback = (correct: number, total: number) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0
  if (percentage >= 80) return 'Excellent performance! Keep it up.'
  if (percentage >= 60) return 'Good work, room for improvement.'
  return 'Focus on this area for better results.'
}

const formatDomainName = (name: string | undefined | null, id: string): string => {
  try {
    // 强制类型转换和空值检查
    const safeName = name ? String(name) : ''
    const safeId = id ? String(id) : 'Unknown'
    
    console.log('formatDomainName called with:', { name: safeName, id: safeId })
    
    // 如果名称为空或无效，使用ID生成默认名称
    if (!safeName || safeName.trim() === '') {
      const testType = getTestTypeFromId(safeId)
      const domainName = getDomainNameFromId(safeId)
      return `${testType} - ${domainName}`
    }
    
    // 根据测试类型添加前缀
    const testType = getTestTypeFromId(safeId)
    
    // 如果名称已经包含测试类型，则直接返回
    if (safeName.includes('SAT') || safeName.includes('PSAT')) {
      return safeName
    }
    
    return `${testType} - ${safeName}`
  } catch (error) {
    console.error('Error in formatDomainName:', error, { name, id })
    return `Domain ${id || 'Unknown'}`
  }
}

// 添加新的辅助函数来根据ID获取域名
const getDomainNameFromId = (id: string): string => {
  const domainMap: Record<string, string> = {
    // Math domains
    'H': 'Algebra',
    'P': 'Advanced Math',
    'Q': 'Problem-Solving and Data Analysis',
    'S': 'Geometry and Trigonometry',
    // English domains
    'INI': 'Information and Ideas',
    'CAS': 'Craft and Structure',
    'EOI': 'Expression of Ideas',
    'SEC': 'Standard English Conventions'
  }
  
  return domainMap[id] || `Domain ${id}`
}

const getTestTypeFromId = (id: string): string => {
  // 根据ID判断测试类型
  const mathDomains = ['H', 'P', 'Q', 'S']
  const englishDomains = ['INI', 'CAS', 'EOI', 'SEC']
  
  if (mathDomains.includes(id)) {
    return 'SAT Math'
  } else if (englishDomains.includes(id)) {
    return 'SAT Reading & Writing'
  }
  
  return 'SAT'
}

const getRecommendations = () => {
  const acc = parseFloat(accuracy.value)
  const recommendations = []
  
  // 基于整体表现的建议
  if (acc < 60) {
    recommendations.push('Focus on understanding core concepts before attempting more practice questions.')
    recommendations.push('Consider reviewing basic study materials to strengthen your foundation.')
  } else if (acc < 80) {
    recommendations.push('Continue regular practice to improve your accuracy and speed.')
    recommendations.push('Review your incorrect answers to identify patterns in your mistakes.')
  } else {
    recommendations.push('Challenge yourself with more difficult questions to maintain your high performance.')
    recommendations.push('Consider timed practice sessions to improve your speed while maintaining accuracy.')
  }
  
  // 基于领域表现的建议
  const weakDomains = validDomains.value
    .filter(domain => domain.total > 0 && (domain.correct / domain.total) * 100 < 60)
    .map(domain => formatDomainName(domain.name, domain.id))
  
  if (weakDomains.length > 0) {
    if (weakDomains.length === 1) {
      recommendations.push(`Focus on improving your performance in ${weakDomains[0]}.`)
    } else if (weakDomains.length === 2) {
      recommendations.push(`Prioritize studying ${weakDomains[0]} and ${weakDomains[1]}.`)
    } else {
      const domains = weakDomains.slice(0, 2).join(', ') + ', and others'
      recommendations.push(`Pay special attention to your weaker areas: ${domains}.`)
    }
  }
  
  return recommendations
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
  if (acc >= 90) return 'You\'re mastering these concepts! Your hard work is paying off. Consistency is key to maintaining this excellent performance.'
  if (acc >= 80) return 'You\'re doing really well! A few more practice sessions and you\'ll be at the top. Keep refining your skills.'
  if (acc >= 70) return 'You\'re on the right track! Focus on your weaker areas to improve further. Regular practice will help you reach the next level.'
  if (acc >= 60) return 'You\'re making progress! Regular practice will help you improve significantly. Don\'t get discouraged by mistakes - they\'re part of learning.'
  return 'Every expert was once a beginner. Keep practicing and you\'ll see improvement! Learning takes time, but your efforts will pay off.'
}

// 实现下载报告功能
const downloadReport = () => {
  try {
    // 创建报告内容
    const reportDate = new Date().toLocaleDateString()
    const reportTime = new Date().toLocaleTimeString()
    
    let reportContent = `
SAT Practice Report
Generated on: ${reportDate} at ${reportTime}

PERFORMANCE SUMMARY
------------------
Total Questions: ${props.totalQuestions}
Correct Answers: ${props.correctAnswers}
Incorrect Answers: ${props.incorrectAnswers}
Accuracy: ${accuracy.value}%
Performance Level: ${getPerformanceLevel()}
Total Time: ${formattedTotalTime.value}
Average Time per Question: ${formattedAvgTimePerQuestion.value}

TOPIC PERFORMANCE
----------------
`

    // 添加领域表现
    validDomains.value.forEach(domain => {
      const domainName = formatDomainName(domain.name, domain.id)
      const domainAccuracy = domain.total > 0 ? ((domain.correct / domain.total) * 100).toFixed(1) : '0.0'
      reportContent += `${domainName}: ${domain.correct}/${domain.total} (${domainAccuracy}%)\n`
    })
    
    // 添加建议
    reportContent += `\nRECOMMENDATIONS\n---------------\n`
    getRecommendations().forEach((recommendation, index) => {
      reportContent += `${index + 1}. ${recommendation}\n`
    })
    
    // 创建并下载文件
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SAT_Practice_Report_${reportDate.replace(/\//g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading report:', error)
    alert('Failed to download report. Please try again.')
  }
}
</script>

<style scoped>
.prose img {
  margin: 1rem auto;
  max-width: 100%;
  height: auto;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}
</style>
