<template>
    <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <!-- Session Stats Header -->
        <div
            class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
            <!-- Mobile Layout -->
            <div class="block sm:hidden space-y-3">
                <!-- Stats Row -->
                <div class="flex items-center justify-between">
                    <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">{{ sessionStats.answeredQuestions }}</div>
                        <div class="text-xs text-gray-600">Answered</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-green-600">{{ sessionStats.correctAnswers }}</div>
                        <div class="text-xs text-gray-600">Correct</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-red-600">{{ sessionStats.incorrectAnswers }}</div>
                        <div class="text-xs text-gray-600">Incorrect</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-purple-600">{{ sessionStats.accuracy.toFixed(1) }}%</div>
                        <div class="text-xs text-gray-600">Accuracy</div>
                    </div>
                </div>

                <!-- Progress Bar Row -->
                <div class="w-full">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"></div>
                    </div>
                </div>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden sm:flex items-center justify-between">
                <div class="flex items-center space-x-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">{{ sessionStats.answeredQuestions }}</div>
                        <div class="text-xs text-gray-600">Answered</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">{{ sessionStats.correctAnswers }}</div>
                        <div class="text-xs text-gray-600">Correct</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">{{ sessionStats.incorrectAnswers }}</div>
                        <div class="text-xs text-gray-600">Incorrect</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">{{ sessionStats.accuracy.toFixed(1) }}%</div>
                        <div class="text-xs text-gray-600">Accuracy</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="flex-1 max-w-xs ml-6">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Question Navigation with Sync Status -->
        <div class="flex justify-between items-center">
            <button @click="$emit('go-to-previous')" :disabled="currentQuestionIndex <= 0"
                class="px-2 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200 flex items-center text-xs sm:text-sm">
                <Icon icon="lucide:chevron-left" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span class="hidden sm:inline">Previous</span>
                <span class="sm:hidden">Prev</span>
            </button>

            <div class="text-center">
                <div class="flex items-center justify-center space-x-2">
                    <h2 class="text-lg sm:text-2xl font-bold text-gray-800">Question {{ currentQuestionIndex + 1 }}</h2>
                    <!-- Sync Status Indicator -->
                    <div v-if="showSyncStatus" class="flex items-center">
                        <Icon v-if="syncStatus === 'synced'" icon="lucide:cloud-check" class="w-4 h-4 text-green-500"
                            title="Synced to cloud" />
                        <Icon v-else-if="syncStatus === 'syncing'" icon="lucide:cloud-upload"
                            class="w-4 h-4 text-blue-500 animate-pulse" title="Syncing to cloud" />
                        <Icon v-else-if="syncStatus === 'local'" icon="lucide:hard-drive" class="w-4 h-4 text-gray-500"
                            title="Stored locally only" />
                        <Icon v-else-if="syncStatus === 'error'" icon="lucide:cloud-off" class="w-4 h-4 text-red-500"
                            title="Sync failed" />
                    </div>
                </div>
                <p class="text-xs sm:text-sm text-gray-600">{{ currentQuestion.domain || 'General' }}</p>
            </div>

            <button @click="$emit('go-to-next')" :disabled="currentQuestionIndex >= totalQuestions - 1"
                class="px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200 flex items-center text-xs sm:text-sm">
                <span class="hidden sm:inline">Next</span>
                <span class="sm:hidden">Next</span>
                <Icon icon="lucide:chevron-right" class="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </button>
        </div>

        <!-- Question Content -->
        <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <!-- Stimulus -->
            <div v-if="cleanedStimulus" class="bg-gray-50 border-b border-gray-200 p-3 sm:p-6">
                <div class="prose max-w-none text-gray-700 overflow-x-auto" v-html="cleanedStimulus"></div>
            </div>

            <!-- Main Question -->
            <div class="p-3 sm:p-6">
                <div class="prose max-w-none text-gray-800 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 overflow-x-auto"
                    v-html="cleanedStem">
                </div>

                <!-- Question Image -->
                <div v-if="currentQuestion.image" class="my-4 sm:my-6 text-center overflow-x-auto">
                    <img :src="currentQuestion.image" alt="Question Image"
                        class="max-w-none h-auto rounded-xl shadow-md mx-auto border border-gray-200">
                </div>

                <!-- Multiple Choice Options -->
                <div v-if="currentQuestion.type === 'mcq'" class="space-y-2 sm:space-y-3">
                    <div v-for="(option, index) in currentQuestion.answerOptions" :key="option.id"
                        @click="selectOption(option.id)"
                        class="group relative overflow-hidden rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300"
                        :class="getOptionClasses(option.id, index)">
                        <div class="p-3 sm:p-4 flex items-start">
                            <div class="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 transition-all duration-300"
                                :class="getOptionIndicatorClasses(option.id)">
                                <span class="font-semibold text-xs sm:text-sm">{{ String.fromCharCode(65 + index)
                                    }}</span>
                            </div>
                            <div class="flex-1 prose max-w-none overflow-x-auto text-sm sm:text-base"
                                v-html="option.content"></div>

                            <!-- Feedback Icons -->
                            <div v-if="localShowFeedback" class="flex-shrink-0 ml-3 sm:ml-4">
                                <div v-if="isCorrectOption(option.id)"
                                    class="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <Icon icon="lucide:check" class="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div v-else-if="localSelectedAnswer === option.id"
                                    class="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <Icon icon="lucide:x" class="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Student Response Input -->
                <div v-else-if="currentQuestion.type === 'spr'" class="space-y-4">
                    <div class="bg-gray-50 rounded-xl p-4 sm:p-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">
                            Enter your answer:
                        </label>
                        <input type="text" v-model="localSelectedAnswer" :disabled="localShowFeedback"
                            class="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base sm:text-lg"
                            placeholder="Type your answer here...">
                        <p class="text-xs sm:text-sm text-gray-500 mt-2">
                            Enter a numerical answer or short text response
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="!localShowFeedback"
            class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 overflow-hidden">
            <button @click="skipQuestion"
                class="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center text-sm sm:text-base">
                <Icon icon="lucide:skip-forward" class="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Skip Question
            </button>

            <button @click="checkAnswer" :disabled="!localSelectedAnswer || isCheckingAnswer"
                class="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow duration-300 flex items-center justify-center text-sm sm:text-base">
                <Icon :icon="isCheckingAnswer ? 'lucide:loader-2' : 'lucide:check-circle'"
                    :class="isCheckingAnswer ? 'animate-spin' : ''" class="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                {{ isCheckingAnswer ? 'Checking...' : 'Check Answer' }}
            </button>
        </div>

        <!-- Enhanced Answer Explanation -->
        <div v-if="localShowFeedback" class="space-y-4 sm:space-y-6">
            <!-- Result Banner with Sync Status -->
            <div class="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                :class="localIsCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'">
                <div class="flex items-center justify-center mb-4">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                        :class="localIsCorrect ? 'bg-green-500' : 'bg-red-500'">
                        <Icon :icon="localIsCorrect ? 'lucide:check' : 'lucide:x'"
                            class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold mb-2"
                    :class="localIsCorrect ? 'text-green-700' : 'text-red-700'">
                    {{ localIsCorrect ? 'Correct!' : 'Incorrect' }}
                </h3>
                <p class="text-sm sm:text-base text-gray-600">
                    {{ localIsCorrect ? 'Great job! You got it right.' : 'Don\'t worry, let\'s review the explanation.'
                    }}
                </p>

                <!-- Sync Status for Wrong Answers -->
                <div v-if="!localIsCorrect && showSyncStatus" class="mt-3 flex items-center justify-center space-x-2">
                    <Icon v-if="syncStatus === 'synced'" icon="lucide:cloud-check" class="w-4 h-4 text-green-500" />
                    <Icon v-else-if="syncStatus === 'syncing'" icon="lucide:cloud-upload"
                        class="w-4 h-4 text-blue-500 animate-pulse" />
                    <Icon v-else-if="syncStatus === 'local'" icon="lucide:hard-drive" class="w-4 h-4 text-gray-500" />
                    <Icon v-else-if="syncStatus === 'error'" icon="lucide:cloud-off" class="w-4 h-4 text-red-500" />
                    <span class="text-xs text-gray-600">
                        {{ getSyncStatusText() }}
                    </span>
                </div>
            </div>

            <!-- MCQ Detailed Explanation -->
            <div v-if="currentQuestion.type === 'mcq'" class="space-y-3 sm:space-y-4">
                <h4 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Answer Explanations</h4>

                <div v-for="explanation in parsedMCQExplanation" :key="explanation.letter"
                    class="bg-white border-2 rounded-lg sm:rounded-xl shadow-sm overflow-hidden transition-all duration-300"
                    :class="getExplanationCardClasses(explanation)">

                    <div class="p-4 sm:p-6">
                        <div class="flex items-center mb-3 sm:mb-4">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 sm:mr-4"
                                :class="getExplanationHeaderClasses(explanation)">
                                <span class="font-bold text-xs sm:text-sm">{{ explanation.letter }}</span>
                            </div>
                            <div class="flex-1">
                                <h5 class="font-semibold text-base sm:text-lg"
                                    :class="getExplanationTitleClasses(explanation)">
                                    Choice {{ explanation.letter }}
                                    <span v-if="explanation.isCorrect" class="text-green-600">(Correct)</span>
                                    <span v-else-if="explanation.isSelected" class="text-red-600">(Your Answer)</span>
                                </h5>
                            </div>

                            <!-- Status Icon -->
                            <div class="ml-auto">
                                <div v-if="explanation.isCorrect"
                                    class="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <Icon icon="lucide:check" class="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div v-else-if="explanation.isSelected"
                                    class="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <Icon icon="lucide:x" class="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        <div class="prose max-w-none text-gray-700 text-sm sm:text-base overflow-x-auto"
                            v-html="explanation.content"></div>
                    </div>
                </div>
            </div>

            <!-- SPR Explanation -->
            <div v-else-if="currentQuestion.type === 'spr'" class="space-y-4 sm:space-y-6">
                <h4 class="text-lg sm:text-xl font-semibold text-gray-800">Answer Review</h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <!-- Your Answer -->
                    <div class="bg-white border-2 rounded-xl p-4 sm:p-6"
                        :class="localIsCorrect ? 'border-green-200' : 'border-red-200'">
                        <h5 class="font-semibold text-base sm:text-lg mb-3"
                            :class="localIsCorrect ? 'text-green-700' : 'text-red-700'">
                            Your Answer
                        </h5>
                        <div class="text-lg sm:text-xl font-mono bg-gray-50 rounded-lg p-3 sm:p-4"
                            :class="localIsCorrect ? 'text-green-600' : 'text-red-600'">
                            {{ localSelectedAnswer || 'No answer provided' }}
                        </div>
                    </div>

                    <!-- Correct Answer(s) -->
                    <div class="bg-white border-2 border-green-200 rounded-xl p-4 sm:p-6">
                        <h5 class="font-semibold text-base sm:text-lg text-green-700 mb-3">
                            Correct Answer{{ currentQuestion.correct_answer?.length > 1 ? 's' : '' }}
                        </h5>
                        <div class="space-y-2">
                            <div v-for="(answer, index) in currentQuestion.correct_answer" :key="index"
                                class="text-lg sm:text-xl font-mono bg-green-50 rounded-lg p-3 sm:p-4 text-green-600">
                                {{ answer }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Explanation -->
                <div class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                    <h5 class="font-semibold text-base sm:text-lg text-gray-800 mb-4">Explanation</h5>
                    <div class="prose max-w-none text-gray-700 text-sm sm:text-base overflow-x-auto"
                        v-html="localExplanation"></div>
                </div>
            </div>

            <!-- Next Question Button -->
            <div class="text-center pt-4 sm:pt-6 overflow-hidden">
                <button @click="nextQuestion"
                    class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow duration-300 flex items-center justify-center text-sm sm:text-base">
                    <Icon icon="lucide:arrow-right" class="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Next Question
                </button>
            </div>
        </div>

        <!-- Debug Info (remove in production) -->
        <div v-if="showDebug" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Local Selected Answer: {{ localSelectedAnswer }}</p>
            <p>Props Selected Answer: {{ selectedAnswer }}</p>
            <p>Local Show Feedback: {{ localShowFeedback }}</p>
            <p>Props Show Feedback: {{ showFeedback }}</p>
            <p>Question ID: {{ currentQuestion?.external_id }}</p>
            <p>Sync Status: {{ syncStatus }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { parseCollegeBoardExplanation, checkAnswer as checkAnswerUtil } from '../utils/enhancedPracticeUtils'

// Automatically enable debug mode only in development environment
const showDebug = ref(import.meta.env.DEV)

const props = defineProps<{
    currentQuestion: any
    currentQuestionIndex: number
    totalQuestions: number
    selectedAnswer: string
    showFeedback: boolean
    isCorrect: boolean
    explanation: string
    syncStatus?: 'synced' | 'syncing' | 'local' | 'error'
    showSyncStatus?: boolean
    sessionStats: {
        totalQuestions: number
        answeredQuestions: number
        correctAnswers: number
        incorrectAnswers: number
        accuracy: number
    }
}>()

const emit = defineEmits<{
    'update:selectedAnswer': [value: string]
    'update:showFeedback': [value: boolean]
    'update:isCorrect': [value: boolean]
    'update:explanation': [value: string]
    'check-answer': []
    'skip-question': []
    'next-question': []
    'go-to-previous': []
    'go-to-next': []
}>()

const localSelectedAnswer = ref('')
const localShowFeedback = ref(false)
const localIsCorrect = ref(false)
const localExplanation = ref('')
const isLoadingProgress = ref(false)
const isCheckingAnswer = ref(false)

// Clean HTML content function
const cleanQuestionContent = (htmlContent: string): string => {
    if (!htmlContent) return ''

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    const srOnlyElements = tempDiv.querySelectorAll('.sr-only')
    srOnlyElements.forEach(element => element.remove())

    const ariaHiddenElements = tempDiv.querySelectorAll('span[aria-hidden="true"]')
    ariaHiddenElements.forEach(element => {
        if (element.textContent && element.textContent.includes('_')) {
            // Keep underline elements unchanged
        }
    })

    return tempDiv.innerHTML
}

// Computed properties for cleaned content
const cleanedStimulus = computed(() => {
    return cleanQuestionContent(props.currentQuestion.stimulus || '')
})

const cleanedStem = computed(() => {
    return cleanQuestionContent(props.currentQuestion.stem || '')
})

// Enhanced MCQ explanation parser
const parsedMCQExplanation = computed(() => {
    if (props.currentQuestion.type !== 'mcq' || !localExplanation.value) return []

    return parseCollegeBoardExplanation(
        localExplanation.value,
        props.currentQuestion.correct_answer[0],
        localSelectedAnswer.value,
        props.currentQuestion.answerOptions
    )
})

const isCorrectOption = (optionId: string): boolean => {
    return checkAnswerUtil(props.currentQuestion, optionId)
}

const selectOption = (optionId: string) => {
    if (!localShowFeedback.value && !isLoadingProgress.value && !isCheckingAnswer.value) {
        console.log('Selecting option:', optionId)
        localSelectedAnswer.value = optionId
    }
}

const getSyncStatusText = (): string => {
    switch (props.syncStatus) {
        case 'synced':
            return 'Synced to cloud'
        case 'syncing':
            return 'Syncing to cloud...'
        case 'local':
            return 'Stored locally only'
        case 'error':
            return 'Sync failed'
        default:
            return ''
    }
}

const getOptionClasses = (optionId: string, _index: number) => {
    if (!localShowFeedback.value) {
        return localSelectedAnswer.value === optionId
            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
    }

    if (isCorrectOption(optionId)) {
        return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
    } else if (localSelectedAnswer.value === optionId) {
        return 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50'
    }
    return 'border-gray-200 bg-gray-50'
}

const getOptionIndicatorClasses = (optionId: string) => {
    if (!localShowFeedback.value) {
        return localSelectedAnswer.value === optionId
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-gray-300 bg-white text-gray-600'
    }

    if (isCorrectOption(optionId)) {
        return 'border-green-500 bg-green-500 text-white'
    } else if (localSelectedAnswer.value === optionId) {
        return 'border-red-500 bg-red-500 text-white'
    }
    return 'border-gray-300 bg-gray-100 text-gray-500'
}

const getExplanationCardClasses = (explanation: any) => {
    if (explanation.isCorrect) {
        return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
    } else if (explanation.isSelected) {
        return 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
    }
    return 'border-gray-200 bg-white'
}

const getExplanationHeaderClasses = (explanation: any) => {
    if (explanation.isCorrect) {
        return 'bg-green-500 text-white'
    } else if (explanation.isSelected) {
        return 'bg-red-500 text-white'
    }
    return 'bg-gray-100 text-gray-600'
}

const getExplanationTitleClasses = (explanation: any) => {
    if (explanation.isCorrect) {
        return 'text-green-700'
    } else if (explanation.isSelected) {
        return 'text-red-700'
    }
    return 'text-gray-700'
}

// Watch for local changes and emit to parent
watch(localSelectedAnswer, (newValue) => {
    console.log('Local selected answer changed:', newValue)
    emit('update:selectedAnswer', newValue)
})

// Watch props and sync to local state
watch(() => props.selectedAnswer, (newValue) => {
    console.log('QuestionArea: selectedAnswer prop changed to', newValue)
    localSelectedAnswer.value = newValue
}, { immediate: true })

watch(() => props.showFeedback, (newValue) => {
    console.log('QuestionArea: showFeedback prop changed to', newValue)
    localShowFeedback.value = newValue
}, { immediate: true })

watch(() => props.isCorrect, (newValue) => {
    console.log('QuestionArea: isCorrect prop changed to', newValue)
    localIsCorrect.value = newValue
}, { immediate: true })

watch(() => props.explanation, (newValue) => {
    console.log('QuestionArea: explanation prop changed')
    localExplanation.value = newValue
}, { immediate: true })

// Watch local state changes and emit to parent
watch(localShowFeedback, (newValue) => {
    console.log('QuestionArea: localShowFeedback changed to', newValue)
    emit('update:showFeedback', newValue)
})

watch(localIsCorrect, (newValue) => {
    console.log('QuestionArea: localIsCorrect changed to', newValue)
    emit('update:isCorrect', newValue)
})

watch(localExplanation, (newValue) => {
    console.log('QuestionArea: localExplanation changed')
    emit('update:explanation', newValue)
})

// Watch for question changes
watch(() => props.currentQuestion?.external_id, async (newQuestionId, oldQuestionId) => {
    if (newQuestionId && newQuestionId !== oldQuestionId) {
        console.log('QuestionArea: Question changed from', oldQuestionId, 'to', newQuestionId)
        // Let parent component control state completely
    }
}, { immediate: true })

const checkAnswer = async () => {
    console.log('QuestionArea: Check answer clicked with:', localSelectedAnswer.value)
    isCheckingAnswer.value = true
    try {
        emit('check-answer')
    } finally {
        // Reset checking state after a delay to show feedback
        setTimeout(() => {
            isCheckingAnswer.value = false
        }, 500)
    }
}

const skipQuestion = () => {
    emit('skip-question')
}

const nextQuestion = () => {
    emit('next-question')
}

onMounted(async () => {
    await nextTick()
    // Let parent component control all state
})
</script>

<style scoped>
.prose img {
    margin: 1rem auto;
    max-width: none;
    height: auto;
}

.prose p {
    margin-bottom: 1rem;
}

.prose ul,
.prose ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

/* Mobile optimizations */
@media (max-width: 640px) {
    .prose {
        font-size: 14px;
    }

    .prose h1,
    .prose h2,
    .prose h3 {
        font-size: 1.1em;
    }

    .prose table,
    .prose pre,
    .prose img {
        max-width: none;
    }
}

/* Prevent layout shifts from hover effects */
.overflow-hidden {
    overflow: hidden;
}

/* Sync status animations */
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
