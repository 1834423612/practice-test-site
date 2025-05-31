<template>
    <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <!-- Session Stats Header -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
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

        <!-- Question Navigation -->
        <div class="flex justify-between items-center">
            <button @click="$emit('go-to-previous')" :disabled="currentQuestionIndex <= 0"
                class="px-2 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200 flex items-center text-xs sm:text-sm">
                <Icon icon="lucide:chevron-left" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span class="hidden sm:inline">Previous</span>
                <span class="sm:hidden">Prev</span>
            </button>

            <div class="text-center">
                <h2 class="text-lg sm:text-2xl font-bold text-gray-800">Question {{ currentQuestionIndex + 1 }}</h2>
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
            <div v-if="currentQuestion.stimulus" class="bg-gray-50 border-b border-gray-200 p-3 sm:p-6">
                <div class="prose max-w-none text-gray-700 overflow-x-auto" v-html="currentQuestion.stimulus"></div>
            </div>

            <!-- Main Question -->
            <div class="p-3 sm:p-6">
                <div class="prose max-w-none w-[110%] text-gray-800 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 overflow-x-auto"
                    v-html="currentQuestion.stem"
                    style="transform: scale(0.9); transform-origin: top left;">
                </div>

                <!-- Question Image -->
                <div v-if="currentQuestion.image" class="my-4 sm:my-6 text-center overflow-x-auto">
                    <img :src="currentQuestion.image" alt="Question Image"
                        class="w-4/5 h-auto rounded-xl shadow-md mx-auto border border-gray-200">
                </div>

                <!-- Multiple Choice Options -->
                <div v-if="currentQuestion.type === 'mcq'" class="space-y-2 sm:space-y-3">
                    <div v-for="(option, index) in currentQuestion.answerOptions" :key="option.id"
                        @click="!showFeedback && selectOption(option.id)"
                        class="group relative overflow-hidden rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300"
                        :class="getOptionClasses(option.id, index)">
                        <div class="p-3 sm:p-4 flex items-start">
                            <div class="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 transition-all duration-300"
                                :class="getOptionIndicatorClasses(option.id)">
                                <span class="font-semibold text-xs sm:text-sm">{{ String.fromCharCode(65 + index) }}</span>
                            </div>
                            <div class="flex-1 prose max-w-none overflow-x-auto text-sm sm:text-base" v-html="option.content"></div>

                            <!-- Feedback Icons -->
                            <div v-if="showFeedback" class="flex-shrink-0 ml-3 sm:ml-4">
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
                        <input type="text" v-model="localSelectedAnswer" :disabled="showFeedback"
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
        <div v-if="!showFeedback" class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <button @click="skipQuestion"
                class="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center text-sm sm:text-base">
                <Icon icon="lucide:skip-forward" class="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Skip Question
            </button>

            <button @click="checkAnswer" :disabled="!localSelectedAnswer"
                class="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm sm:text-base">
                <Icon icon="lucide:check-circle" class="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Check Answer
            </button>
        </div>

        <!-- Enhanced Answer Explanation -->
        <div v-if="showFeedback" class="space-y-4 sm:space-y-6">
            <!-- Result Banner -->
            <div class="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                :class="isCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'">
                <div class="flex items-center justify-center mb-4">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                        :class="isCorrect ? 'bg-green-500' : 'bg-red-500'">
                        <Icon :icon="isCorrect ? 'lucide:check' : 'lucide:x'" class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold mb-2" :class="isCorrect ? 'text-green-700' : 'text-red-700'">
                    {{ isCorrect ? 'Correct!' : 'Incorrect' }}
                </h3>
                <p class="text-sm sm:text-base text-gray-600">
                    {{ isCorrect ? 'Great job! You got it right.' : 'Don\'t worry, let\'s review the explanation.' }}
                </p>
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
                                <h5 class="font-semibold text-base sm:text-lg" :class="getExplanationTitleClasses(explanation)">
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

                        <div class="prose max-w-none text-gray-700 text-sm sm:text-base overflow-x-auto" v-html="explanation.content"></div>
                    </div>
                </div>
            </div>

            <!-- SPR Explanation -->
            <div v-else-if="currentQuestion.type === 'spr'" class="space-y-4 sm:space-y-6">
                <h4 class="text-lg sm:text-xl font-semibold text-gray-800">Answer Review</h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <!-- Your Answer -->
                    <div class="bg-white border-2 rounded-xl p-4 sm:p-6"
                        :class="isCorrect ? 'border-green-200' : 'border-red-200'">
                        <h5 class="font-semibold text-base sm:text-lg mb-3" :class="isCorrect ? 'text-green-700' : 'text-red-700'">
                            Your Answer
                        </h5>
                        <div class="text-lg sm:text-xl font-mono bg-gray-50 rounded-lg p-3 sm:p-4"
                            :class="isCorrect ? 'text-green-600' : 'text-red-600'">
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
                    <div class="prose max-w-none text-gray-700 text-sm sm:text-base overflow-x-auto" v-html="explanation"></div>
                </div>
            </div>

            <!-- Next Question Button -->
            <div class="text-center pt-4 sm:pt-6">
                <button @click="nextQuestion"
                    class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm sm:text-base">
                    <Icon icon="lucide:arrow-right" class="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Next Question
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { parseCollegeBoardExplanation, checkAnswer as checkAnswerUtil } from '../utils/enhancedPracticeUtils'

const props = defineProps<{
    currentQuestion: any
    currentQuestionIndex: number
    totalQuestions: number
    selectedAnswer: string
    showFeedback: boolean
    isCorrect: boolean
    explanation: string
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
    'check-answer': []
    'skip-question': []
    'next-question': []
    'go-to-previous': []
    'go-to-next': []
}>()

const localSelectedAnswer = ref(props.currentQuestion.userAnswer || props.selectedAnswer)

// Enhanced MCQ explanation parser using the new utility
const parsedMCQExplanation = computed(() => {
    if (props.currentQuestion.type !== 'mcq' || !props.explanation) return []

    return parseCollegeBoardExplanation(
        props.explanation,
        props.currentQuestion.correct_answer[0],
        props.selectedAnswer,
        props.currentQuestion.answerOptions
    )
})

const isCorrectOption = (optionId: string): boolean => {
    return checkAnswerUtil(props.currentQuestion, optionId)
}

const selectOption = (optionId: string) => {
    localSelectedAnswer.value = optionId
}

const getOptionClasses = (optionId: string, _index: number) => {
    if (!props.showFeedback) {
        return localSelectedAnswer.value === optionId
            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
    }

    if (isCorrectOption(optionId)) {
        return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
    } else if (props.selectedAnswer === optionId) {
        return 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50'
    }
    return 'border-gray-200 bg-gray-50'
}

const getOptionIndicatorClasses = (optionId: string) => {
    if (!props.showFeedback) {
        return localSelectedAnswer.value === optionId
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-gray-300 bg-white text-gray-600'
    }

    if (isCorrectOption(optionId)) {
        return 'border-green-500 bg-green-500 text-white'
    } else if (props.selectedAnswer === optionId) {
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

watch(() => props.selectedAnswer, (newValue) => {
    localSelectedAnswer.value = newValue
})

watch(localSelectedAnswer, (newValue) => {
    emit('update:selectedAnswer', newValue)
})

watch(() => props.currentQuestion, (newQ) => {
    localSelectedAnswer.value = newQ.userAnswer || ''
})

const checkAnswer = () => {
    emit('check-answer')
}

const skipQuestion = () => {
    emit('skip-question')
}

const nextQuestion = () => {
    emit('next-question')
}
</script>

<style scoped>
.prose img {
    margin: 1rem auto;
    max-width: none; /* Allow images to be wider than container */
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
    
    .prose h1, .prose h2, .prose h3 {
        font-size: 1.1em;
    }
    
    .prose table,
    .prose pre,
    .prose img {
        max-width: none;
    }
}
</style>