<template>
  <div class="question-navigator relative">
    <!-- Inline Question Counter Button -->
    <button
      ref="toggleButton"
      @click="toggleNavigator"
      class="flex items-center space-x-1 sm:space-x-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
      :class="{ 'text-blue-600 bg-blue-50': isOpen }"
    >
      <Icon icon="lucide:file-text" class="w-4 h-4 sm:w-5 sm:h-5" />
      <span class="text-sm sm:text-base">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
      <Icon :icon="isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-3 h-3 sm:w-4 sm:h-4" />
    </button>

    <!-- Dropdown Navigator Panel -->
    <div
      v-if="isOpen"
      ref="panel"
      :style="panelStyle"
      class="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] transform transition-all duration-300 overflow-hidden flex flex-col max-h-[70vh]"
      :class="panelClasses"
    >
      <!-- Header -->
      <div class="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-base font-semibold text-gray-800">Question Navigator</h3>
          <button
            @click="closeNavigator"
            class="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
          >
            <Icon icon="lucide:x" class="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <div class="text-xs text-gray-600">
          {{ answeredCount }}/{{ totalQuestions }} answered
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div
            class="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="p-3 border-b border-gray-200 bg-white">
        <div class="relative mb-2">
          <Icon icon="lucide:search" class="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search questions..."
            class="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"
          >
        </div>

        <div class="flex gap-1 overflow-x-auto pb-1">
          <button
            @click="filterType = 'all'"
            class="px-2 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            All
          </button>
          <button
            @click="filterType = 'answered'"
            class="px-2 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            :class="filterType === 'answered' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Answered
          </button>
          <button
            @click="filterType = 'correct'"
            class="px-2 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            :class="filterType === 'correct' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Correct
          </button>
          <button
            @click="filterType = 'unanswered'"
            class="px-2 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            :class="filterType === 'unanswered' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Unanswered
          </button>
          <button
            @click="filterType = 'incorrect'"
            class="px-2 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            :class="filterType === 'incorrect' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Wrong
          </button>
        </div>
      </div>

      <!-- Question List with Virtual Scrolling -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto" @scroll="handleScroll" @wheel.stop>
        <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
          <div
            v-for="(question, index) in visibleQuestions"
            :key="question.external_id"
            :style="{
              position: 'absolute',
              top: `${(startIndex + index) * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`
            }"
            class="px-2 py-0.5"
          >
            <div
              @click="goToQuestion(getOriginalIndex(startIndex + index))"
              class="w-full p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm"
              :class="getQuestionItemClass(question, getOriginalIndex(startIndex + index))"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    :class="getQuestionNumberClass(question, getOriginalIndex(startIndex + index))"
                  >
                    {{ getOriginalIndex(startIndex + index) + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-gray-800">
                      Question {{ getOriginalIndex(startIndex + index) + 1 }}
                    </div>
                    <div class="text-xs text-gray-500 truncate">
                      {{ question.domain || 'General' }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full flex items-center justify-center">
                    <Icon
                      v-if="getQuestionStatus(question, getOriginalIndex(startIndex + index)) === 'correct'"
                      icon="lucide:check"
                      class="w-3 h-3 text-green-600"
                    />
                    <Icon
                      v-else-if="getQuestionStatus(question, getOriginalIndex(startIndex + index)) === 'incorrect'"
                      icon="lucide:x"
                      class="w-3 h-3 text-red-600"
                    />
                    <Icon
                      v-else-if="getQuestionStatus(question, getOriginalIndex(startIndex + index)) === 'current'"
                      icon="lucide:eye"
                      class="w-3 h-3 text-blue-600"
                    />
                    <div
                      v-else
                      class="w-1.5 h-1.5 rounded-full bg-gray-300"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div class="p-2 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center">
          <button
            @click="goToPrevious"
            :disabled="currentQuestionIndex <= 0"
            class="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200 flex items-center text-xs"
          >
            <Icon icon="lucide:chevron-left" class="w-3 h-3 mr-1" />
            Previous
          </button>
          
          <span class="text-xs text-gray-600 font-medium">
            {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </span>
          
          <button
            @click="goToNext"
            :disabled="currentQuestionIndex >= totalQuestions - 1"
            class="px-2 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200 flex items-center text-xs"
          >
            Next
            <Icon icon="lucide:chevron-right" class="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isOpen"
      @click="closeNavigator"
      class="fixed inset-0 bg-transparent z-[59] sm:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { getQuestionProgress } from '@/utils/enhancedPracticeUtils'

const props = defineProps<{
  questions: any[]
  currentQuestionIndex: number
}>()

const emit = defineEmits<{
  'go-to-question': [index: number]
  'go-to-previous': []
  'go-to-next': []
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const filterType = ref<'all' | 'answered' | 'unanswered' | 'correct' | 'incorrect'>('all')
const scrollContainer = ref<HTMLElement>()

// 定位相关的 refs
const toggleButton = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const panelStyle = ref<Record<string, string>>({})
const panelClasses = ref<string>('')

// 改进的定位逻辑
const updatePosition = async () => {
  if (!toggleButton.value || !panel.value) return
  
  await nextTick()
  
  const btnRect = toggleButton.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const isMobile = viewportWidth < 640 // sm breakpoint
  
  // 面板的基础宽度（对应 Tailwind 的 w-80，即 320px）
  const panelWidth = 320
  const panelMaxHeight = Math.min(viewportHeight * 0.7, 500)
  // 移动端使用更大的边距
  const margin = isMobile ? 24 : 16
  
  // 计算可用空间
  const spaceLeft = btnRect.left
  const spaceRight = viewportWidth - btnRect.right
  const spaceTop = btnRect.top
  const spaceBottom = viewportHeight - btnRect.bottom
  
  // 重置样式
  panelStyle.value = {}
  panelClasses.value = ''
  
  // 水平定位逻辑
  if (isMobile) {
    // 移动端特殊处理
    if (spaceRight >= panelWidth + margin) {
      // 右侧有足够空间，左对齐
      panelStyle.value.left = '0'
      panelStyle.value.right = 'auto'
      panelClasses.value = 'w-80'
    } else if (spaceLeft >= panelWidth + margin) {
      // 左侧有足够空间，右对齐
      panelStyle.value.right = '0'
      panelStyle.value.left = 'auto'
      panelClasses.value = 'w-80'
    } else {
      // 移动端空间不足时，更激进的左偏移
      const availableWidth = Math.min(viewportWidth - margin * 2, panelWidth)
      const buttonCenter = btnRect.left + btnRect.width / 2
      const panelCenter = availableWidth / 2
      
      // 计算理想的左偏移（让面板中心对齐按钮中心）
      let leftOffset = buttonCenter - panelCenter
      
      // 确保面板不会超出右边界，增加额外的安全边距
      const maxLeftOffset = viewportWidth - availableWidth - margin
      leftOffset = Math.min(leftOffset, maxLeftOffset)
      
      // 确保面板不会超出左边界
      leftOffset = Math.max(leftOffset, margin)
      
      // 转换为相对于按钮的偏移
      const relativeOffset = leftOffset - btnRect.left
      
      panelStyle.value.left = `${relativeOffset}px`
      panelStyle.value.right = 'auto'
      panelStyle.value.width = `${availableWidth}px`
      panelClasses.value = 'max-w-[calc(100vw-3rem)]' // 移动端使用更大的边距
    }
  } else {
    // 桌面端逻辑保持不变
    if (spaceRight >= panelWidth + margin) {
      panelStyle.value.left = '0'
      panelStyle.value.right = 'auto'
      panelClasses.value = 'w-80'
    } else if (spaceLeft >= panelWidth + margin) {
      panelStyle.value.right = '0'
      panelStyle.value.left = 'auto'
      panelClasses.value = 'w-80'
    } else {
      const availableWidth = Math.min(viewportWidth - margin * 2, panelWidth)
      const leftOffset = Math.max(margin - btnRect.left, -(panelWidth - btnRect.width) / 2)
      
      panelStyle.value.left = `${leftOffset}px`
      panelStyle.value.right = 'auto'
      panelStyle.value.width = `${availableWidth}px`
      panelClasses.value = 'max-w-[calc(100vw-2rem)]'
    }
  }
  
  // 垂直定位逻辑（检查是否需要向上展开）
  if (spaceBottom < panelMaxHeight + margin && spaceTop > spaceBottom) {
    // 向上展开
    panelStyle.value.top = 'auto'
    panelStyle.value.bottom = '100%'
    panelStyle.value.marginBottom = '0.5rem'
    panelStyle.value.marginTop = '0'
  } else {
    // 向下展开（默认）
    panelStyle.value.top = '100%'
    panelStyle.value.bottom = 'auto'
    panelStyle.value.marginTop = '0.5rem'
    panelStyle.value.marginBottom = '0'
  }
}

const itemHeight = 55
const visibleCount = 8
const scrollTop = ref(0)

// Progress tracking
const questionProgress = ref(getQuestionProgress())

// Computed properties
const totalQuestions = computed(() => props.questions.length)

const answeredCount = computed(() => {
  return props.questions.filter(q => questionProgress.value[q.external_id]?.answered).length
})

const progressPercentage = computed(() => {
  return totalQuestions.value > 0 ? (answeredCount.value / totalQuestions.value) * 100 : 0
})

const filteredQuestions = computed(() => {
  let filtered = props.questions

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((q, index) => {
      const questionNumber = (index + 1).toString()
      const domain = (q.domain || '').toLowerCase()
      return questionNumber.includes(query) || domain.includes(query)
    })
  }

  if (filterType.value !== 'all') {
    filtered = filtered.filter(q => {
      const progress = questionProgress.value[q.external_id]
      switch (filterType.value) {
        case 'answered':
          return progress?.answered
        case 'unanswered':
          return !progress?.answered
        case 'correct':
          return progress?.answered && progress?.isCorrect
        case 'incorrect':
          return progress?.answered && !progress?.isCorrect
        default:
          return true
      }
    })
  }

  return filtered
})

const totalHeight = computed(() => filteredQuestions.value.length * itemHeight)

const startIndex = computed(() => {
  return Math.floor(scrollTop.value / itemHeight)
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + visibleCount + 2, filteredQuestions.value.length)
})

const visibleQuestions = computed(() => {
  return filteredQuestions.value.slice(startIndex.value, endIndex.value)
})

// Methods
const toggleNavigator = () => {
  isOpen.value = !isOpen.value
}

const closeNavigator = () => {
  isOpen.value = false
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

const getOriginalIndex = (filteredIndex: number): number => {
  const filteredQuestion = filteredQuestions.value[filteredIndex]
  return props.questions.findIndex(q => q.external_id === filteredQuestion.external_id)
}

const goToQuestion = (index: number) => {
  emit('go-to-question', index)
  closeNavigator()
}

const goToPrevious = () => {
  emit('go-to-previous')
}

const goToNext = () => {
  emit('go-to-next')
}

const getQuestionStatus = (question: any, originalIndex: number): 'correct' | 'incorrect' | 'current' | 'unanswered' => {
  if (originalIndex === props.currentQuestionIndex) {
    return 'current'
  }
  
  const progress = questionProgress.value[question.external_id]
  if (progress?.answered) {
    return progress.isCorrect ? 'correct' : 'incorrect'
  }
  
  return 'unanswered'
}

const getQuestionItemClass = (question: any, originalIndex: number) => {
  const status = getQuestionStatus(question, originalIndex)
  const isCurrent = originalIndex === props.currentQuestionIndex
  
  if (isCurrent) {
    return 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 border-2'
  }
  
  switch (status) {
    case 'correct':
      return 'border-green-200 bg-green-50 hover:border-green-300'
    case 'incorrect':
      return 'border-red-200 bg-red-50 hover:border-red-300'
    default:
      return 'border-gray-200 bg-white hover:border-gray-300'
  }
}

const getQuestionNumberClass = (question: any, originalIndex: number) => {
  const status = getQuestionStatus(question, originalIndex)
  
  switch (status) {
    case 'current':
      return 'bg-blue-500 text-white'
    case 'correct':
      return 'bg-green-500 text-white'
    case 'incorrect':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// Update progress when questions change
watch(() => props.questions, () => {
  questionProgress.value = getQuestionProgress()
}, { deep: true })

// 监听 isOpen 变化并更新位置
watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updatePosition()
    })
  }
})

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeNavigator()
  }
}

// 处理窗口大小变化和滚动
const handleResize = () => {
  if (isOpen.value) {
    updatePosition()
  }
}

const handleWindowScroll = () => {
  if (isOpen.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleWindowScroll, true)
  
  // 初始化滚动位置
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = props.currentQuestionIndex * itemHeight
    scrollTop.value = props.currentQuestionIndex * itemHeight
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleWindowScroll, true)
})
</script>

<style scoped>
.question-navigator ::-webkit-scrollbar {
  width: 4px;
}

.question-navigator ::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.question-navigator ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.question-navigator ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>