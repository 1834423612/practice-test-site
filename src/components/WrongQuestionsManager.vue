<template>
  <div class="max-w-6xl mx-2 sm:mx-6 space-y-3 sm:space-y-6">
    <!-- Header with User Info and Batch Sync Status -->
    <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-red-100">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4">
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
            <Icon icon="lucide:x-circle" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Wrong Questions Collection</h2>
            <p class="text-gray-600 text-xs sm:text-sm lg:text-base">
              {{ user ? `Synced with cloud for ${user.username}` : 'Review and practice your incorrect answers' }}
            </p>
          </div>
        </div>
        <div class="mt-2 sm:mt-0 flex items-center justify-center space-x-3 sm:space-x-4">
          <div class="text-center">
            <div class="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{{ wrongQuestions.length }}</div>
            <div class="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div class="text-center">
            <div class="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{{ unsyncedCount }}</div>
            <div class="text-xs sm:text-sm text-gray-600">Unsynced</div>
          </div>
        </div>
      </div>

      <!-- User Status with Enhanced Sync Info -->
      <div v-if="user" class="bg-white rounded-lg p-2 sm:p-4 border border-red-200 mb-3 sm:mb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <Icon icon="lucide:user" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <div class="text-xs sm:text-sm text-gray-700">
              <p class="font-medium">Logged in as {{ user.username }}</p>
              <p class="text-gray-500">Cloud sync enabled</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 sm:space-x-4">
            <div class="flex items-center space-x-1 sm:space-x-2">
              <div
                class="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                :class="getSyncStatusColor()"
              ></div>
              <span class="text-xs sm:text-sm text-gray-600 capitalize">{{ getSyncStatusText() }}</span>
            </div>
            <div v-if="lastSyncTime" class="text-xs text-gray-500">
              Last sync: {{ formatLastSyncTime() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Guest Notice -->
      <div v-else class="bg-white rounded-lg p-2 sm:p-4 border border-red-200">
        <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Icon icon="lucide:info" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div class="text-xs sm:text-sm text-gray-700">
            <p class="font-medium mb-1">Local Storage Only</p>
            <p class="leading-snug">
              Your wrong questions are stored locally. 
              <button @click="$emit('show-auth')" class="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </button>
              to sync with cloud and access from any device.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Mode Notice -->
    <div v-if="isInPracticeMode" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <Icon icon="lucide:alert-triangle" class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
        <div class="text-xs sm:text-sm text-yellow-800">
          <p class="font-medium">Practice Mode Active</p>
          <p>Review buttons are disabled while you're in practice mode to prevent losing your current progress.</p>
        </div>
      </div>
    </div>

    <!-- Enhanced Controls with Upload Sync -->
    <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-6 shadow-md mb-3 sm:mb-6">
      <div class="flex flex-col gap-3 sm:gap-4">
        <!-- Search and Sort -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div class="relative flex-1">
            <Icon icon="lucide:search" class="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search wrong questions..."
              class="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            >
          </div>
          <div class="flex-shrink-0">
            <select
              v-model="sortBy"
              class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="attempts">Most Attempts</option>
              <option value="domain">By Domain</option>
              <option value="sync_status">Sync Status</option>
            </select>
          </div>
        </div>

        <!-- Enhanced Action Buttons -->
        <div class="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-end">
          <!-- Smart Sync Button (only for authenticated users) -->
          <button
            v-if="user"
            @click="handleSmartSync"
            :disabled="syncing"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon 
              :icon="syncing ? 'lucide:loader-2' : 'lucide:refresh-cw'" 
              :class="syncing ? 'animate-spin' : ''"
              class="w-4 h-4 mr-1 sm:mr-2" 
            />
            <span>{{ syncing ? 'Syncing...' : 'Smart Sync' }}</span>
            <span class="hidden sm:inline">{{ syncing ? 'Syncing...' : 'Smart Sync' }}</span>
          </button>

          <!-- Force Upload Button (only for authenticated users) -->
          <button
            v-if="user && wrongQuestions.length > 0"
            @click="handleForceUpload"
            :disabled="syncing"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon 
              :icon="syncing ? 'lucide:loader-2' : 'lucide:upload'" 
              :class="syncing ? 'animate-spin' : ''"
              class="w-4 h-4 mr-1 sm:mr-2" 
            />
            <span>{{ syncing ? 'Uploading...' : 'Upload All' }}</span>
            <span class="hidden sm:inline">{{ syncing ? 'Uploading...' : `Force Upload All (${wrongQuestions.length})` }}</span>
          </button>

          <!-- Download from Cloud Button -->
          <button
            v-if="user"
            @click="handleDownloadFromCloud"
            :disabled="syncing"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon 
              :icon="syncing ? 'lucide:loader-2' : 'lucide:cloud-download'" 
              :class="syncing ? 'animate-spin' : ''"
              class="w-4 h-4 mr-1 sm:mr-2" 
            />
            <span>{{ syncing ? 'Downloading...' : 'Download' }}</span>
            <span class="hidden sm:inline">{{ syncing ? 'Downloading...' : 'Download from Cloud' }}</span>
          </button>

          <!-- 其他按钮 -->
          <button
            @click="showImportExport = true"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <Icon icon="lucide:download" class="w-4 h-4 mr-1 sm:mr-2" />
            <span>Import/Export</span>
            <span class="hidden sm:inline">Import/Export</span>
          </button>
          
          <button
            @click="startWrongQuestionsPractice"
            :disabled="wrongQuestions.length === 0 || isInPracticeMode"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon icon="lucide:play" class="w-4 h-4 mr-1 sm:mr-2" />
            <span>Practice</span>
            <span class="hidden sm:inline">Practice Wrong Questions</span>
          </button>
          
          <button
            @click="confirmClearAll"
            :disabled="wrongQuestions.length === 0"
            class="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon icon="lucide:trash-2" class="w-4 h-4 mr-1 sm:mr-2" />
            <span>Clear All</span>
            <span class="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Wrong Questions List with Sync Status -->
    <div v-if="filteredWrongQuestions.length === 0" class="text-center py-8 sm:py-12">
      <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon icon="lucide:check-circle" class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Wrong Questions</h3>
      <p class="text-sm sm:text-base text-gray-600">
        {{ wrongQuestions.length === 0 ? 'You haven\'t answered any questions incorrectly yet!' : 'No questions match your search criteria.' }}
      </p>
    </div>

    <div v-else class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      <div
        v-for="wrongQuestion in paginatedQuestions"
        :key="wrongQuestion.id"
        class="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
      >
        <div class="p-3 sm:p-6">
          <!-- Question Header with Enhanced Sync Status -->
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon icon="lucide:x" class="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-sm sm:text-base text-gray-800 truncate">
                  Question from {{ wrongQuestion.question.domain || 'General' }}
                </h3>
                <div class="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <span>{{ wrongQuestion.attempts }} attempt{{ wrongQuestion.attempts > 1 ? 's' : '' }}</span>
                  <span class="hidden sm:inline">•</span>
                  <span class="hidden sm:inline">{{ formatDate(wrongQuestion.timestamp) }}</span>
                  <span>{{ formatDateShort(wrongQuestion.timestamp) }}</span>
                  <span>•</span>
                  <div class="flex items-center space-x-1">
                    <Icon 
                      v-if="getSyncStatusForQuestion(wrongQuestion)" 
                      icon="lucide:cloud-check" 
                      class="w-3 h-3 sm:w-4 sm:h-4 text-green-500" 
                      title="Synced to cloud"
                    />
                    <Icon 
                      v-else 
                      icon="lucide:hard-drive" 
                      class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" 
                      title="Local only"
                    />
                    <span class="hidden sm:inline">{{ getSyncStatusForQuestion(wrongQuestion) ? 'Synced' : 'Local only' }}</span>
                    <span>{{ getSyncStatusForQuestion(wrongQuestion) ? 'Synced' : 'Local' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                @click="reviewQuestion(wrongQuestion)"
                :disabled="isInPracticeMode"
                class="px-2 sm:px-3 py-1 rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center"
                :class="isInPracticeMode 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
              >
                <Icon icon="lucide:eye" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span class="hidden sm:inline">Review</span>
                <span class="sm:hidden">View</span>
              </button>
              <button
                @click="removeWrongQuestion(wrongQuestion.externalId)"
                class="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-xs sm:text-sm flex items-center"
              >
                <Icon icon="lucide:trash-2" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span class="hidden sm:inline">Remove</span>
                <span class="sm:hidden">Del</span>
              </button>
            </div>
          </div>

          <!-- Question Content with proper overflow handling -->
          <div class="space-y-3 sm:space-y-4 overflow-hidden">
            <!-- Stimulus -->
            <div v-if="wrongQuestion.question.stimulus" 
                 class="bg-gray-50 rounded-lg p-2 sm:p-4 overflow-x-auto">
              <div class="prose max-w-none text-xs sm:text-sm min-w-0" v-html="wrongQuestion.question.stimulus"></div>
            </div>

            <!-- Question Stem -->
            <div class="prose max-w-none text-sm sm:text-base overflow-x-auto min-w-0" v-html="wrongQuestion.question.stem"></div>

            <!-- Question Image with proper sizing -->
            <div v-if="wrongQuestion.question.image" class="overflow-x-auto">
              <img 
                :src="wrongQuestion.question.image" 
                alt="Question Image"
                class="max-w-none h-auto rounded-lg shadow-sm border border-gray-200 mx-auto"
                style="max-height: 400px;"
              >
            </div>

            <!-- Answer Comparison -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
              <!-- Your Answer -->
              <div class="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4 overflow-x-auto">
                <h4 class="font-semibold text-red-700 mb-1 sm:mb-2 flex items-center text-xs sm:text-sm">
                  <Icon icon="lucide:x" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Your Answer
                </h4>
                <div class="text-xs sm:text-sm min-w-0">
                  <span class="font-medium">{{ getUserAnswerDisplay(wrongQuestion) }}</span>
                  <div class="mt-1 break-words" v-html="getUserAnswerContent(wrongQuestion)"></div>
                </div>
              </div>

              <!-- Correct Answer -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4 overflow-x-auto">
                <h4 class="font-semibold text-green-700 mb-1 sm:mb-2 flex items-center text-xs sm:text-sm">
                  <Icon icon="lucide:check" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Correct Answer
                </h4>
                <div class="text-xs sm:text-sm min-w-0">
                  <span class="font-medium">{{ getCorrectAnswerDisplay(wrongQuestion) }}</span>
                  <div class="mt-1 break-words" v-html="getCorrectAnswerContent(wrongQuestion)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center space-x-3 sm:space-x-4 mt-6 sm:mt-8">
        <button
          v-if="currentPage > 1"
          @click="currentPage--"
          :disabled="currentPage <= 1"
          class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
        >
          Previous
        </button>
        
        <span class="text-xs sm:text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          v-if="totalPages > 1"
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Import/Export Modal -->
    <div v-if="showImportExport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Import/Export Data</h3>
        
        <div class="space-y-3 sm:space-y-4">
          <!-- Export -->
          <div>
            <h4 class="font-medium text-gray-700 mb-2 text-sm sm:text-base">Export Data</h4>
            <button
              @click="exportData"
              class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
            >
              <Icon icon="lucide:download" class="w-4 h-4 mr-2" />
              Download JSON File
            </button>
          </div>

          <!-- Import -->
          <div>
            <h4 class="font-medium text-gray-700 mb-2 text-sm sm:text-base">Import Data</h4>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              class="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
          </div>
        </div>

        <div class="flex justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6">
          <button
            @click="showImportExport = false"
            class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Sync Conflict Modal -->
    <SyncConflictModal
      v-if="showConflictModal"
      :conflicts="syncConflicts"
      @close="showConflictModal = false"
      @resolve="handleConflictResolution"
    />
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
  getUnsyncedQuestions,
  type WrongQuestion
} from '@/utils/enhancedPracticeUtils'
import { authService, type AuthUser } from '@/utils/auth'
import { wrongQuestionsSyncService, type SyncConflict, type ConflictResolution } from '@/utils/wrongQuestionsSync'
import SyncConflictModal from './SyncConflictModal.vue'

const props = defineProps<{
  isInPracticeMode?: boolean
}>()

const emit = defineEmits<{
  'start-wrong-questions-practice': [questions: any[]]
  'review-question': [question: any]
  'show-auth': []
}>()

const user = ref<AuthUser | null>(null)
const wrongQuestions = ref<WrongQuestion[]>([])
const unsyncedCount = ref(0)
const searchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10
const showImportExport = ref(false)
const fileInput = ref<HTMLInputElement>()
const syncing = ref(false)
const syncStatus = ref<'synced' | 'syncing' | 'error' | 'never'>('never')
const lastSyncTime = ref<Date | null>(null)
const showConflictModal = ref(false)
const syncConflicts = ref<SyncConflict[]>([])

// 添加云端状态检查
const cloudStatus = ref<{ hasCloudData: boolean; cloudCount: number; localCount: number }>({
  hasCloudData: false,
  cloudCount: 0,
  localCount: 0
})

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
      case 'sync_status':
        if (a.is_synced === b.is_synced) return b.timestamp - a.timestamp
        return a.is_synced ? 1 : -1 // Unsynced first
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

const getSyncStatusColor = (): string => {
  switch (syncStatus.value) {
    case 'synced':
      return 'bg-green-500'
    case 'syncing':
      return 'bg-yellow-500'
    case 'error':
      return 'bg-red-500'
    case 'never':
    default:
      return 'bg-gray-500'
  }
}

const getSyncStatusText = (): string => {
  switch (syncStatus.value) {
    case 'synced':
      return 'Synced'
    case 'syncing':
      return 'Syncing'
    case 'error':
      return 'Error'
    case 'never':
    default:
      return 'Not synced'
  }
}

// 修复同步状态显示逻辑
const getSyncStatusForQuestion = (question: WrongQuestion): boolean => {
  // 如果用户未登录，显示为未同步
  if (!user.value) {
    return false
  }
  
  // 返回题目的实际同步状态
  return question.is_synced || false
}

const loadWrongQuestions = async () => {
  wrongQuestions.value = await getWrongQuestions()
}

const loadUnsyncedCount = async () => {
  const unsynced = await getUnsyncedQuestions()
  unsyncedCount.value = unsynced.length
}

const loadUser = async () => {
  user.value = await authService.getCurrentUser()
}

// 修复：删除错题时同步删除云端数据
const removeWrongQuestion = async (externalId: string) => {
  if (confirm('Are you sure you want to remove this question from your wrong questions collection?')) {
    // 先从本地删除
    removeWrongQuestionUtil(externalId)
    
    // 如果用户已登录，同时从云端删除
    if (user.value) {
      try {
        const success = await wrongQuestionsSyncService.deleteCloudWrongQuestion(externalId)
        if (!success) {
          console.warn('Failed to delete question from cloud, but local deletion succeeded')
        }
      } catch (error) {
        console.error('Error deleting question from cloud:', error)
      }
    }
    
    await loadWrongQuestions()
    await loadUnsyncedCount()
    await checkCloudStatus()
  }
}

const confirmClearAll = () => {
  if (confirm('Are you sure you want to clear all wrong questions? This action cannot be undone.')) {
    clearWrongQuestions()
    loadWrongQuestions()
    loadUnsyncedCount()
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

// 检查云端状态
const checkCloudStatus = async () => {
  if (!user.value) {
    cloudStatus.value = { hasCloudData: false, cloudCount: 0, localCount: 0 }
    return
  }
  
  try {
    cloudStatus.value = await wrongQuestionsSyncService.checkCloudStatus()
    console.log("Cloud status:", cloudStatus.value)
    
    // 更新同步状态显示
    if (cloudStatus.value.hasCloudData || unsyncedCount.value === 0) {
      syncStatus.value = 'synced'
    } else {
      syncStatus.value = 'never'
    }
  } catch (error) {
    console.error("Failed to check cloud status:", error)
    syncStatus.value = 'error'
  }
}

// 智能同步 - 使用新的双向同步
const handleSmartSync = async () => {
  if (!user.value) {
    emit('show-auth')
    return
  }

  syncing.value = true
  syncStatus.value = 'syncing'

  try {
    const result = await wrongQuestionsSyncService.intelligentBidirectionalSync()
    
    if (result.conflicts.length > 0) {
      syncConflicts.value = result.conflicts
      showConflictModal.value = true
      syncStatus.value = 'error'
    } else {
      syncStatus.value = 'synced'
      lastSyncTime.value = new Date()
      await loadWrongQuestions()
      await loadUnsyncedCount()
      await checkCloudStatus()
      
      if (result.synced > 0) {
        alert(`Successfully synced ${result.synced} questions!`)
      } else {
        alert('All questions are already in sync!')
      }
    }

    if (result.errors.length > 0) {
      console.error('Smart sync errors:', result.errors)
      alert(`Sync completed with errors: ${result.errors.join(', ')}`)
    }
  } catch (error) {
    console.error('Smart sync error:', error)
    syncStatus.value = 'error'
    alert('Smart sync failed. Please try again.')
  } finally {
    syncing.value = false
  }
}

// 强制上传所有题目
const handleForceUpload = async () => {
  if (!user.value) {
    emit('show-auth')
    return
  }

  if (!confirm(`This will upload all ${wrongQuestions.value.length} questions to the cloud, potentially overwriting existing data. Continue?`)) {
    return
  }

  syncing.value = true
  syncStatus.value = 'syncing'

  try {
    const result = await wrongQuestionsSyncService.forceUploadAll()
    
    if (result.success) {
      syncStatus.value = 'synced'
      lastSyncTime.value = new Date()
      await loadWrongQuestions()
      await loadUnsyncedCount()
      await checkCloudStatus()
      
      alert(`Successfully uploaded ${result.synced} questions to cloud!`)
    } else {
      syncStatus.value = 'error'
      alert(`Upload failed: ${result.errors.join(', ')}`)
    }
  } catch (error) {
    console.error('Force upload error:', error)
    syncStatus.value = 'error'
    alert('Force upload failed. Please try again.')
  } finally {
    syncing.value = false
  }
}

// 修改现有的 handleDownloadFromCloud 方法
const handleDownloadFromCloud = async () => {
  if (!user.value) {
    emit('show-auth')
    return
  }

  syncing.value = true
  syncStatus.value = 'syncing'

  try {
    const success = await wrongQuestionsSyncService.syncFromCloud()
    syncStatus.value = success ? 'synced' : 'error'
    if (success) {
      lastSyncTime.value = new Date()
      await loadWrongQuestions()
      await loadUnsyncedCount()
      await checkCloudStatus()
      alert('Successfully downloaded questions from cloud!')
    } else {
      alert('Failed to download from cloud. Please try again.')
    }
  } catch (error) {
    console.error('Download sync error:', error)
    syncStatus.value = 'error'
    alert('Download failed. Please try again.')
  } finally {
    syncing.value = false
  }
}

const handleConflictResolution = async (resolutions: ConflictResolution[]) => {
  showConflictModal.value = false
  syncing.value = true

  try {
    const success = await wrongQuestionsSyncService.resolveConflicts(resolutions)
    syncStatus.value = success ? 'synced' : 'error'
    if (success) {
      lastSyncTime.value = new Date()
      await loadWrongQuestions()
      await loadUnsyncedCount()
    }
  } catch (error) {
    console.error('Conflict resolution error:', error)
    syncStatus.value = 'error'
  } finally {
    syncing.value = false
  }
}

// 修改 performInitialSync 方法 - 使用智能双向同步
const performInitialSync = async () => {
  if (user.value) {
    console.log('Performing initial intelligent sync...')
    await handleSmartSync()
  }
}

// 修复填空题显示问题
const getUserAnswerDisplay = (wrongQuestion: WrongQuestion): string => {
  if (wrongQuestion.question.type === 'spr') {
    // 填空题直接显示答案，不显示字母
    return wrongQuestion.userAnswer || 'No answer'
  } else {
    // 选择题显示字母
    const optionIndex = wrongQuestion.question.answerOptions?.findIndex(
      (opt: any) => opt.id === wrongQuestion.userAnswer
    )
    return optionIndex >= 0 ? `${String.fromCharCode(65 + optionIndex)}.` : '?.'
  }
}

const getUserAnswerContent = (wrongQuestion: WrongQuestion): string => {
  if (wrongQuestion.question.type === 'spr') {
    // 填空题不显示额外内容
    return ''
  } else {
    // 选择题显示选项内容
    const option = wrongQuestion.question.answerOptions?.find(
      (opt: any) => opt.id === wrongQuestion.userAnswer
    )
    return option?.content || 'Unknown answer'
  }
}

const getCorrectAnswerDisplay = (wrongQuestion: WrongQuestion): string => {
  if (wrongQuestion.question.type === 'spr') {
    // 填空题直接显示正确答案
    return Array.isArray(wrongQuestion.question.correct_answer) 
      ? wrongQuestion.question.correct_answer.join(' or ')
      : wrongQuestion.question.correct_answer || wrongQuestion.correctAnswer
  } else {
    // 选择题显示字母
    return `${wrongQuestion.correctAnswer}.`
  }
}

const getCorrectAnswerContent = (wrongQuestion: WrongQuestion): string => {
  if (wrongQuestion.question.type === 'spr') {
    // 填空题不显示额外内容
    return ''
  } else {
    // 选择题显示选项内容
    const correctLetter = wrongQuestion.correctAnswer
    const correctIndex = correctLetter.charCodeAt(0) - 65
    const option = wrongQuestion.question.answerOptions?.[correctIndex]
    return option?.content || 'Unknown answer'
  }
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

const formatDateShort = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatLastSyncTime = (): string => {
  if (!lastSyncTime.value) return 'Never'
  
  const now = new Date()
  const diff = now.getTime() - lastSyncTime.value.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const exportData = async () => {
  const data = await exportWrongQuestions()
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
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      if (await importWrongQuestions(content)) {
        await loadWrongQuestions()
        await loadUnsyncedCount()
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
const handleWrongQuestionsUpdate = async () => {
  await loadWrongQuestions()
  await loadUnsyncedCount()
}

// 修改 onMounted
onMounted(async () => {
  await loadUser()
  await loadWrongQuestions()
  await loadUnsyncedCount()
  
  // 检查云端状态并执行初始同步
  await performInitialSync()
  
  onWrongQuestionsUpdate(handleWrongQuestionsUpdate)
})

onUnmounted(() => {
  offWrongQuestionsUpdate(handleWrongQuestionsUpdate)
})
</script>

<style scoped>
/* 确保容器可以处理溢出内容 */
.prose {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.prose img {
  max-width: 100%;
  height: auto;
}

.prose table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .prose {
    font-size: 14px;
  }
  
  .prose img {
    max-width: none;
    width: auto;
    height: auto;
  }
  
  .prose table {
    font-size: 12px;
  }
}

/* 确保图片在容器内正确显示 */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
