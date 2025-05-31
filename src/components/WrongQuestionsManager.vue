<template>
  <div class="max-w-6xl mx-6 space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-red-100">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full">
          <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <Icon icon="lucide:x-circle" class="w-6 h-6 text-white" />
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Wrong Questions Collection</h2>
            <p class="text-gray-600 text-sm sm:text-base">Review and practice your incorrect answers</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-xl sm:text-2xl font-bold text-red-600">{{ wrongQuestions.length }}</div>
            <div class="text-sm text-gray-600">Wrong Questions</div>
          </div>
        </div>
      </div>

      <!-- Storage Notice -->
      <div class="bg-white rounded-lg p-3 sm:p-4 border border-red-200">
        <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Icon icon="lucide:info" class="w-5 h-5 text-blue-500" />
          <div class="text-sm text-gray-700">
            <p class="font-medium mb-1">Local Storage Notice</p>
            <p class="leading-snug">
              Your wrong questions are stored locally in your browser. Use the export/import feature to transfer data between devices.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Mode Notice -->
  <div v-if="isInPracticeMode" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div class="flex items-center space-x-3">
      <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-yellow-600" />
      <div class="text-sm text-yellow-800">
        <p class="font-medium">Practice Mode Active</p>
        <p>Review buttons are disabled while you're in practice mode to prevent losing your current progress.</p>
      </div>
    </div>
  </div>

    <!-- Controls -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-md mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Search and Sort on one row -->
        <div class="flex flex-1 items-center space-x-4">
          <div class="relative flex-1">
            <Icon icon="lucide:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search wrong questions..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            >
          </div>
          <div>
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="attempts">Most Attempts</option>
              <option value="domain">By Domain</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons with vertical margin -->
        <div class="flex flex-wrap gap-3 justify-center md:justify-end">
          <button
            @click="showImportExport = true"
            class="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 my-2"
          >
            <Icon icon="lucide:download" class="w-5 h-5 mr-2" />
            Import/Export
          </button>
          
          <button
            @click="startWrongQuestionsPractice"
            :disabled="wrongQuestions.length === 0 || isInPracticeMode"
            class="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 my-2"
          >
            <Icon icon="lucide:play" class="w-5 h-5 mr-2" />
            Practice Wrong Questions
          </button>
          
          <button
            @click="confirmClearAll"
            :disabled="wrongQuestions.length === 0"
            class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 my-2"
          >
            <Icon icon="lucide:trash-2" class="w-5 h-5 mr-2" />
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Wrong Questions List -->
    <div v-if="filteredWrongQuestions.length === 0" class="text-center py-12">
      <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon icon="lucide:check-circle" class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Wrong Questions</h3>
      <p class="text-gray-600">
        {{ wrongQuestions.length === 0 ? 'You haven\'t answered any questions incorrectly yet!' : 'No questions match your search criteria.' }}
      </p>
    </div>

    <div v-else class="space-y-4 mb-6">
      <div
        v-for="wrongQuestion in paginatedQuestions"
        :key="wrongQuestion.id"
        class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div class="p-6">
          <!-- Question Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon icon="lucide:x" class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">
                  Question from {{ wrongQuestion.question.domain || 'General' }}
                </h3>
                <p class="text-sm text-gray-600">
                  Attempted {{ wrongQuestion.attempts }} time{{ wrongQuestion.attempts > 1 ? 's' : '' }} • 
                  {{ formatDate(wrongQuestion.timestamp) }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="reviewQuestion(wrongQuestion)"
                :disabled="isInPracticeMode"
                class="px-3 py-1 rounded-lg transition-colors duration-200 text-sm flex items-center"
                :class="isInPracticeMode 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
              >
                <Icon icon="lucide:eye" class="w-4 h-4 mr-1" />
                Review
              </button>
              <button
                @click="removeWrongQuestion(wrongQuestion.externalId)"
                class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm flex items-center"
              >
                <Icon icon="lucide:trash-2" class="w-4 h-4 mr-1" />
                Remove
              </button>
            </div>
          </div>

          <!-- Question Content -->
          <div class="space-y-4">
            <!-- Stimulus -->
            <div v-if="wrongQuestion.question.stimulus" 
                 class="bg-gray-50 rounded-lg p-4">
              <div class="prose max-w-none text-sm" v-html="wrongQuestion.question.stimulus"></div>
            </div>

            <!-- Question Stem -->
            <div class="prose max-w-none" v-html="wrongQuestion.question.stem"></div>

            <!-- Answer Comparison -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <!-- Your Answer -->
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 class="font-semibold text-red-700 mb-2 flex items-center">
                  <Icon icon="lucide:x" class="w-4 h-4 mr-1" />
                  Your Answer
                </h4>
                <div class="text-sm">
                  <span class="font-medium">{{ getUserAnswerLetter(wrongQuestion) }}.</span>
                  <span class="ml-2" v-html="getUserAnswerContent(wrongQuestion)"></span>
                </div>
              </div>

              <!-- Correct Answer -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-semibold text-green-700 mb-2 flex items-center">
                  <Icon icon="lucide:check" class="w-4 h-4 mr-1" />
                  Correct Answer
                </h4>
                <div class="text-sm">
                  <span class="font-medium">{{ wrongQuestion.correctAnswer }}.</span>
                  <span class="ml-2" v-html="getCorrectAnswerContent(wrongQuestion)"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center space-x-4 mt-8">
        <button
          v-if="currentPage > 1"
          @click="currentPage--"
          :disabled="currentPage <= 1"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
        >
          Previous
        </button>
        
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          v-if="totalPages > 1"
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Import/Export Modal -->
    <div v-if="showImportExport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Import/Export Data</h3>
        
        <div class="space-y-4">
          <!-- Export -->
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Export Data</h4>
            <button
              @click="exportData"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
            >
              <Icon icon="lucide:download" class="w-4 h-4 mr-2" />
              Download JSON File
            </button>
          </div>

          <!-- Import -->
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Import Data</h4>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showImportExport = false"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { 
  getWrongQuestions, 
  removeWrongQuestion as removeWrongQuestionUtil,
  clearWrongQuestions,
  exportWrongQuestions,
  importWrongQuestions,
  onWrongQuestionsUpdate,
  offWrongQuestionsUpdate,
  type WrongQuestion
} from '@/utils/enhancedPracticeUtils'

const props = defineProps<{
  isInPracticeMode?: boolean
}>()

const emit = defineEmits<{
  'start-wrong-questions-practice': [questions: any[]]
  'review-question': [question: any]
}>()

const wrongQuestions = ref<WrongQuestion[]>([])
const searchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10
const showImportExport = ref(false)
const fileInput = ref<HTMLInputElement>()

const filteredWrongQuestions = computed(() => {
  let filtered = wrongQuestions.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(q => {
      const domain = (q.question.domain || '').toLowerCase()
      const stem = (q.question.stem || '').toLowerCase()
      return domain.includes(query) || stem.includes(query)
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return b.timestamp - a.timestamp
      case 'oldest':
        return a.timestamp - b.timestamp
      case 'attempts':
        return b.attempts - a.attempts
      case 'domain':
        return (a.question.domain || '').localeCompare(b.question.domain || '')
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredWrongQuestions.value.length / itemsPerPage)
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWrongQuestions.value.slice(start, end)
})

const loadWrongQuestions = () => {
  wrongQuestions.value = getWrongQuestions()
}

const removeWrongQuestion = (externalId: string) => {
  if (confirm('Are you sure you want to remove this question from your wrong questions collection?')) {
    removeWrongQuestionUtil(externalId)
    loadWrongQuestions()
  }
}

const confirmClearAll = () => {
  if (confirm('Are you sure you want to clear all wrong questions? This action cannot be undone.')) {
    clearWrongQuestions()
    loadWrongQuestions()
  }
}

const startWrongQuestionsPractice = () => {
  const questions = wrongQuestions.value.map(wq => wq.question)
  emit('start-wrong-questions-practice', questions)
}

const reviewQuestion = (wrongQuestion: WrongQuestion) => {
  if (!props.isInPracticeMode) {
    emit('review-question', wrongQuestion.question)
  }
}

const getUserAnswerLetter = (wrongQuestion: WrongQuestion): string => {
  const optionIndex = wrongQuestion.question.answerOptions?.findIndex(
    (opt: any) => opt.id === wrongQuestion.userAnswer
  )
  return optionIndex >= 0 ? String.fromCharCode(65 + optionIndex) : '?'
}

const getUserAnswerContent = (wrongQuestion: WrongQuestion): string => {
  const option = wrongQuestion.question.answerOptions?.find(
    (opt: any) => opt.id === wrongQuestion.userAnswer
  )
  return option?.content || 'Unknown answer'
}

const getCorrectAnswerContent = (wrongQuestion: WrongQuestion): string => {
  const correctLetter = wrongQuestion.correctAnswer
  const correctIndex = correctLetter.charCodeAt(0) - 65
  const option = wrongQuestion.question.answerOptions?.[correctIndex]
  return option?.content || 'Unknown answer'
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const exportData = () => {
  const data = exportWrongQuestions()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sat-wrong-questions-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showImportExport.value = false
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      if (importWrongQuestions(content)) {
        loadWrongQuestions()
        alert('Data imported successfully!')
      } else {
        alert('Failed to import data. Please check the file format.')
      }
    } catch (error) {
      alert('Failed to import data. Please check the file format.')
    }
    showImportExport.value = false
  }
  reader.readAsText(file)
}

// Setup reactive updates
const handleWrongQuestionsUpdate = () => {
  loadWrongQuestions()
}

onMounted(() => {
  loadWrongQuestions()
  onWrongQuestionsUpdate(handleWrongQuestionsUpdate)
})

onUnmounted(() => {
  offWrongQuestionsUpdate(handleWrongQuestionsUpdate)
})
</script>