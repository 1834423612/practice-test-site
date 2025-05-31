<template>
    <div class="min-h-screen mt-2 sm:mt-6">
        <div class="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
            <!-- Header with Timer, Stats, and Controls -->
            <div v-if="started && !practiceEnded"
                class="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm z-[35] relative">

                <!-- Mobile Layout -->
                <div class="flex flex-col space-y-3 sm:hidden">
                    <!-- Top row: Timer and Question Counter with Navigator -->
                    <div class="flex items-center justify-between">
                        <!-- Timer -->
                        <div v-if="useTimer" class="flex items-center space-x-1 text-gray-700 font-semibold">
                            <Icon :icon="timerType === 'countdown' ? 'lucide:timer' : 'lucide:clock'" class="w-4 h-4" />
                            <span class="text-sm">{{ formatTime(timerType === 'countdown' ? remainingTime : elapsedTime)
                                }}</span>
                        </div>

                        <!-- Question Counter with Navigator -->
                        <QuestionNavigator v-if="questions.length > 0" :questions="questions"
                            :currentQuestionIndex="currentQuestionIndex" @go-to-question="goToQuestion"
                            @go-to-previous="goToPrevious" @go-to-next="goToNext" />
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full">
                        <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{{ sessionStats.answeredQuestions }}/{{ sessionStats.totalQuestions }}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                :style="{ width: `${sessionStats.accuracy || 0}%` }"></div>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center space-x-2">
                        <!-- Wrong Questions Button -->
                        <button @click="showWrongQuestions = true"
                            class="flex-1 px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center text-xs">
                            <Icon icon="lucide:x-circle" class="w-3 h-3 mr-1" />
                            <span>Wrong ({{ wrongQuestionsCount }})</span>
                        </button>

                        <!-- End Practice Button -->
                        <button @click="confirmEndPractice"
                            class="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 text-xs">
                            <span>End</span>
                        </button>
                    </div>
                </div>

                <!-- Desktop Layout -->
                <div class="hidden sm:flex sm:justify-between sm:items-center">
                    <!-- Left side: Timer and Question Counter -->
                    <div class="flex items-center space-x-6">
                        <!-- Timer -->
                        <div v-if="useTimer" class="flex items-center space-x-2 text-gray-700 font-semibold">
                            <Icon :icon="timerType === 'countdown' ? 'lucide:timer' : 'lucide:clock'" class="w-5 h-5" />
                            <span class="text-lg">{{ formatTime(timerType === 'countdown' ? remainingTime : elapsedTime)
                                }}</span>
                        </div>

                        <!-- Question Counter with Navigator -->
                        <QuestionNavigator v-if="questions.length > 0" :questions="questions"
                            :currentQuestionIndex="currentQuestionIndex" @go-to-question="goToQuestion"
                            @go-to-previous="goToPrevious" @go-to-next="goToNext" />
                    </div>

                    <!-- Right side: Action buttons -->
                    <div class="flex items-center space-x-4">
                        <!-- Wrong Questions Button -->
                        <button @click="showWrongQuestions = true"
                            class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center text-sm">
                            <Icon icon="lucide:x-circle" class="w-4 h-4 mr-2" />
                            Wrong Questions ({{ wrongQuestionsCount }})
                        </button>

                        <!-- End Practice Button -->
                        <button @click="confirmEndPractice"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 text-sm">
                            End Practice
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md relative overflow-hidden">
                <!-- Decorative elements -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-green-200"></div>
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-200 to-blue-200"></div>

                <div class="p-3 sm:p-6">
                    <!-- Practice Settings -->
                    <PracticeSettings v-if="!started" :assessmentTypes="assessmentTypes" :testTypes="testTypes"
                        :englishDomains="englishDomains" :mathDomains="mathDomains"
                        @start-practice="handleStartPractice" />

                    <!-- Practice Area -->
                    <div v-else-if="!practiceEnded">
                        <!-- Loading State -->
                        <div v-if="loading" class="text-center py-8 sm:py-12">
                            <Icon icon="lucide:loader-2"
                                class="animate-spin text-3xl sm:text-4xl text-blue-500 mx-auto mb-4" />
                            <p class="text-gray-700 text-sm sm:text-base">Loading question...</p>
                        </div>

                        <!-- Question Area with horizontal scroll for images -->
                        <div v-else-if="currentQuestion" class="overflow-x-auto">
                            <QuestionArea :currentQuestion="currentQuestion"
                                :currentQuestionIndex="currentQuestionIndex" :totalQuestions="totalAvailableQuestions"
                                v-model:selectedAnswer="selectedAnswer" :showFeedback="showFeedback"
                                :isCorrect="isCorrect" :explanation="explanation" :sessionStats="sessionStats"
                                @check-answer="checkAnswer" @skip-question="skipQuestion" @next-question="nextQuestion"
                                @go-to-previous="goToPrevious" @go-to-next="goToNext" />
                        </div>
                    </div>

                    <!-- Results Page -->
                    <ResultsPage v-else-if="practiceEnded" :totalQuestions="totalQuestions"
                        :correctAnswers="correctAnswers" :incorrectAnswers="incorrectAnswers" :elapsedTime="elapsedTime"
                        :domainPerformance="domainPerformance" @restart-practice="restartPractice" />
                </div>
            </div>
        </div>

        <!-- Wrong Questions Manager Modal -->
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import PracticeSettings from '../components/PracticeSettings.vue'
import QuestionArea from '../components/QuestionArea.vue'
import QuestionNavigator from '../components/QuestionNavigator.vue'
import WrongQuestionsManager from '../components/WrongQuestionsManager.vue'
import ResultsPage from '../components/ResultsPage.vue'
import {
    formatTime,
    getSessionStats,
    getWrongQuestions,
    resetTimer,
    saveQuestionProgress,
    checkAnswer as checkAnswerUtil,
    saveWrongQuestion,
    onWrongQuestionsUpdate,
    offWrongQuestionsUpdate
} from '../utils/enhancedPracticeUtils'

// Get route for query parameters
const route = useRoute()

// Component state
const assessmentTypes = ref([
    { id: 100, name: 'PSAT/NMSQT & PSAT 10' },
    { id: 99, name: 'SAT' },
    { id: 102, name: 'PSAT 8/9' }
])

const testTypes = ref([
    { id: 1, name: 'Reading and Writing' },
    { id: 2, name: 'Math' }
])

const englishDomains = ref([
    { id: 'INI', name: 'Information and Ideas' },
    { id: 'CAS', name: 'Craft and Structure' },
    { id: 'EOI', name: 'Expression of Ideas' },
    { id: 'SEC', name: 'Standard English Conventions' }
])

const mathDomains = ref([
    { id: 'H', name: 'Algebra' },
    { id: 'P', name: 'Advanced Math' },
    { id: 'Q', name: 'Problem-Solving and Data Analysis' },
    { id: 'S', name: 'Geometry and Trigonometry' }
])

// Practice state
const started = ref(false)
const useTimer = ref(false)
const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
const timerDuration = ref(134 * 60)
const elapsedTime = ref(0)
const remainingTime = ref(0)
const timerInterval = ref<number | null>(null)
const totalAvailableQuestions = ref(0)
const loading = ref(false)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref('')
const explanation = ref('')
const showFeedback = ref(false)
const isCorrect = ref(false)
const practiceEnded = ref(false)
const totalQuestions = ref(0)
const correctAnswers = ref(0)
const incorrectAnswers = ref(0)
const domainPerformance = ref<Record<string, any>>({})
const showWrongQuestions = ref(false)
const wrongQuestionsCount = ref(0)

// Computed properties
const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value]
})

const sessionStats = computed(() => {
    const answeredStats = getSessionStats(questions.value.slice(0, currentQuestionIndex.value + 1))
    return {
        answeredQuestions: answeredStats.answeredQuestions,
        totalQuestions: questions.value.length,
        correctAnswers: correctAnswers.value,
        incorrectAnswers: incorrectAnswers.value,
        accuracy: answeredStats.accuracy
    }
})

// Methods
const updateWrongQuestionsCount = () => {
    wrongQuestionsCount.value = getWrongQuestions().length
}

const handleStartPractice = async (settings: any) => {
    started.value = true
    useTimer.value = settings.useTimer
    timerType.value = settings.timerType
    timerDuration.value = settings.timerDuration
    loading.value = true

    // Reset timer state
    resetTimer()
    elapsedTime.value = 0
    remainingTime.value = settings.timerDuration

    if (settings.resetProgress) {
        clearCompletedQuestions()
    }

    try {
        await fetchQuestionIds(settings.selectedAssessment, settings.selectedTest, settings.selectedDomains)
        totalAvailableQuestions.value = questions.value.length
        await loadNextQuestion()
        loading.value = false
        if (useTimer.value) {
            startTimer()
        }
    } catch (error) {
        console.error('Error starting practice:', error)
        loading.value = false
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'There was an error starting the practice. Please try again.',
        })
    }
}

const fetchQuestionIds = async (assessmentId: number, testId: number, domainIds: string[]) => {
    const response = await axios.post('https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-questions', {
        asmtEventId: assessmentId,
        test: testId,
        domain: domainIds.join(',')
    })

    const completedQuestions = getCompletedQuestions()
    questions.value = response.data
        .filter((q: any) => q.external_id && !completedQuestions.includes(q.external_id))
        .map((q: any) => ({ ...q, loaded: false }))
}

const loadNextQuestion = async () => {
    if (currentQuestionIndex.value < questions.value.length) {
        const question = questions.value[currentQuestionIndex.value]
        if (!question.loaded) {
            try {
                const response = await axios.post('https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-question', {
                    external_id: question.external_id
                })
                Object.assign(question, response.data, { loaded: true })
                if (question.image) {
                    question.image = `https://example.com/images/${question.image}`
                }
            } catch (error) {
                console.error('Error fetching question details:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'There was an error loading the question. Please try again.',
                })
            }
        }
    } else {
        endPractice()
    }
}

const checkAnswer = () => {
    const question = currentQuestion.value

    // Use the fixed answer checking logic
    isCorrect.value = checkAnswerUtil(question, selectedAnswer.value)

    showFeedback.value = true
    explanation.value = question.rationale

    // 保存当前题目的作答状态
    question.userAnswer = selectedAnswer.value
    question.answered = true
    question.isCorrect = isCorrect.value

    totalQuestions.value++

    if (isCorrect.value) {
        correctAnswers.value++
    } else {
        incorrectAnswers.value++
        // Only save to wrong questions if the answer is actually incorrect
        saveWrongQuestion(question, selectedAnswer.value)
    }

    // Save progress
    const progress = {
        questionId: question.external_id,
        answered: true,
        isCorrect: isCorrect.value,
        userAnswer: selectedAnswer.value,
        timestamp: Date.now()
    }

    saveQuestionProgress(question.external_id, progress)
    updateDomainPerformance(question.domain, isCorrect.value)
    saveCompletedQuestion(question.external_id)
}

const nextQuestion = async () => {
    currentQuestionIndex.value++
    selectedAnswer.value = ''
    showFeedback.value = false
    loading.value = true
    await loadNextQuestion()
    loading.value = false
}

const skipQuestion = () => {
    nextQuestion()
}

const goToQuestion = async (index: number) => {
    if (index >= 0 && index < questions.value.length) {
        currentQuestionIndex.value = index
        const nextQ = questions.value[index]
        if (nextQ.answered) {
            selectedAnswer.value = nextQ.userAnswer || ''
            showFeedback.value = true
        } else {
            selectedAnswer.value = ''
            showFeedback.value = false
        }
        loading.value = true
        await loadNextQuestion()
        loading.value = false
    }
}

const goToPrevious = () => {
    if (currentQuestionIndex.value > 0) {
        goToQuestion(currentQuestionIndex.value - 1)
    }
}

const goToNext = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        goToQuestion(currentQuestionIndex.value + 1)
    } else {
        nextQuestion()
    }
}

const confirmEndPractice = () => {
    Swal.fire({
        title: 'End Practice?',
        text: "Are you sure you want to end the practice?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, end it!'
    }).then((result) => {
        if (result.isConfirmed) {
            endPractice()
        }
    })
}

const endPractice = () => {
    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
    practiceEnded.value = true
}

const restartPractice = () => {
    // Reset all state
    started.value = false
    currentQuestionIndex.value = 0
    questions.value = []
    selectedAnswer.value = ''
    showFeedback.value = false
    elapsedTime.value = 0
    remainingTime.value = timerDuration.value
    practiceEnded.value = false
    totalQuestions.value = 0
    correctAnswers.value = 0
    incorrectAnswers.value = 0
    domainPerformance.value = {}

    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }

    // Reset timer state
    resetTimer()
}

const startTimer = () => {
    if (timerType.value === 'countdown') {
        remainingTime.value = timerDuration.value
        timerInterval.value = setInterval(() => {
            remainingTime.value--
            if (remainingTime.value <= 0) {
                endPractice()
            }
        }, 1000)
    } else {
        timerInterval.value = setInterval(() => {
            elapsedTime.value++
        }, 1000)
    }
}

const updateDomainPerformance = (domain: string, isCorrect: boolean) => {
    if (!domainPerformance.value[domain]) {
        domainPerformance.value[domain] = { id: domain, correct: 0, total: 0, name: domain }
    }
    domainPerformance.value[domain].total++
    if (isCorrect) {
        domainPerformance.value[domain].correct++
    }
}

const getCompletedQuestions = (): string[] => {
    const saved = localStorage.getItem('completedQuestions')
    return saved ? JSON.parse(saved) : []
}

const saveCompletedQuestion = (questionId: string) => {
    const completedQuestions = getCompletedQuestions()
    if (!completedQuestions.includes(questionId)) {
        completedQuestions.push(questionId)
        localStorage.setItem('completedQuestions', JSON.stringify(completedQuestions))
    }
}

const clearCompletedQuestions = () => {
    localStorage.removeItem('completedQuestions')
}

const startWrongQuestionsPractice = (wrongQuestions: any[]) => {
    questions.value = wrongQuestions.map(q => ({ ...q, loaded: true }))
    currentQuestionIndex.value = 0
    totalAvailableQuestions.value = questions.value.length
    selectedAnswer.value = ''
    showFeedback.value = false
    showWrongQuestions.value = false
    started.value = true
    practiceEnded.value = false
}

const reviewQuestion = (question: any) => {
    // Add the question to current practice session for review
    questions.value = [{ ...question, loaded: true }]
    currentQuestionIndex.value = 0
    totalAvailableQuestions.value = 1
    selectedAnswer.value = ''
    showFeedback.value = false
    showWrongQuestions.value = false
    started.value = true
    practiceEnded.value = false
}

// Load wrong questions from URL query parameters
const loadWrongQuestionsFromQuery = async () => {
    if (route.query.mode === 'wrong-questions' && route.query.questions) {
        try {
            loading.value = true
            const questionIds = JSON.parse(route.query.questions as string)

            if (Array.isArray(questionIds) && questionIds.length > 0) {
                const wrongQuestions = getWrongQuestions()
                const questionsToLoad = wrongQuestions
                    .filter(wq => questionIds.includes(wq.externalId))
                    .map(wq => wq.question)

                if (questionsToLoad.length > 0) {
                    startWrongQuestionsPractice(questionsToLoad)
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'No Questions Found',
                        text: 'Could not find the specified wrong questions.'
                    })
                }
            }
            loading.value = false
        } catch (error) {
            console.error('Error loading wrong questions from query:', error)
            loading.value = false
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load wrong questions.'
            })
        }
    }
}

// Load a single question for review from URL query parameters
const loadReviewQuestionFromQuery = async () => {
    if (route.query.mode === 'review' && route.query.questionId) {
        try {
            loading.value = true
            const questionId = route.query.questionId as string

            const wrongQuestions = getWrongQuestions()
            const questionToReview = wrongQuestions.find(wq => wq.externalId === questionId)

            if (questionToReview) {
                reviewQuestion(questionToReview.question)
            } else {
                // Try to fetch the question from API if not found in wrong questions
                try {
                    const response = await axios.post('https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-question', {
                        external_id: questionId
                    })

                    if (response.data) {
                        reviewQuestion({ ...response.data, loaded: true })
                    } else {
                        throw new Error('Question not found')
                    }
                } catch (apiError) {
                    console.error('Error fetching question from API:', apiError)
                    Swal.fire({
                        icon: 'error',
                        title: 'Question Not Found',
                        text: 'Could not find the specified question for review.'
                    })
                }
            }
            loading.value = false
        } catch (error) {
            console.error('Error loading review question from query:', error)
            loading.value = false
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load question for review.'
            })
        }
    }
}

// Watch for question changes to reset state
watch(currentQuestionIndex, () => {
    isCorrect.value = false
    showFeedback.value = false
    selectedAnswer.value = ''
})

// Watch for route query changes
watch(() => route.query, (newQuery) => {
    if (newQuery.mode === 'wrong-questions' && newQuery.questions) {
        loadWrongQuestionsFromQuery()
    } else if (newQuery.mode === 'review' && newQuery.questionId) {
        loadReviewQuestionFromQuery()
    }
}, { immediate: false, deep: true })

// Setup reactive wrong questions count updates
onMounted(() => {
    updateWrongQuestionsCount()
    onWrongQuestionsUpdate(updateWrongQuestionsCount)

    // Check for query parameters on initial load
    if (route.query.mode === 'wrong-questions' && route.query.questions) {
        loadWrongQuestionsFromQuery()
    } else if (route.query.mode === 'review' && route.query.questionId) {
        loadReviewQuestionFromQuery()
    }
})

// Cleanup on unmount
onUnmounted(() => {
    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
    }
    offWrongQuestionsUpdate(updateWrongQuestionsCount)
})
</script>

<style>
.prose img {
    margin: 1rem auto;
    max-width: none;
    /* Allow images to be wider than container */
}

/* Ensure content doesn't overflow on mobile */
@media (max-width: 640px) {
    .prose {
        font-size: 14px;
    }

    .prose h1,
    .prose h2,
    .prose h3 {
        font-size: 1.2em;
    }

    .prose p {
        margin-bottom: 0.75em;
    }

    /* Allow horizontal scrolling for wide content */
    .prose table,
    .prose pre,
    .prose img {
        max-width: none;
    }
}

/* Custom styles for action buttons on mobile */
@media (max-width: 640px) {
    .question-actions button {
        font-size: 0.75rem;
        padding: 0.5rem 1rem;
    }
}
</style>