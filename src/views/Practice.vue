<template>
    <div class="min-h-screen mt-2 sm:mt-6">
        <div class="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
            <!-- Practice Exit Warning Modal with improved styling -->
            <div v-if="showExitWarning" class="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
                <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all duration-300 scale-100">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="lucide:alert-triangle" class="w-8 h-8 text-red-600" />
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Practice Session Active</h3>
                        <p class="text-gray-600 mb-6">
                            You have an active practice session. Leaving now will end your current progress.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button
                                @click="confirmExit"
                                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                                data-umami-event="end-practice-click"
                            >
                                End Practice
                            </button>
                            <button
                                @click="cancelExit"
                                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                                data-umami-event="continue-practice-click"
                            >
                                Continue Practice
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Header with Timer, Stats, and Controls -->
            <div v-if="started && !practiceEnded"
                class="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm z-[35] relative">

                <!-- Mobile Layout -->
                <div class="flex flex-col space-y-3 sm:hidden">
                    <!-- Top row: Timer and Question Counter with Navigator -->
                    <div class="flex items-center justify-between">
                        <!-- Timer -->
                        <div v-if="useTimer" class="flex items-center space-x-1 text-gray-700 font-semibold" data-umami-event="timer-display-click">
                            <Icon :icon="timerType === 'countdown' ? 'lucide:timer' : 'lucide:clock'" class="w-4 h-4" />
                            <span class="text-sm">{{ formatTime(timerType === 'countdown' ? remainingTime : elapsedTime) }}</span>
                        </div>

                        <!-- Question Counter with Navigator -->
                        <QuestionNavigator v-if="questions.length > 0" :questions="questions"
                            :currentQuestionIndex="currentQuestionIndex" @go-to-question="goToQuestion"
                            @go-to-previous="goToPrevious" @go-to-next="goToNext" data-umami-event="question-navigator-click" />
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full" data-umami-event="progress-bar-click">
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
                            class="flex-1 px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center text-xs"
                            data-umami-event="wrong-questions-click">
                            <Icon icon="lucide:x-circle" class="w-3 h-3 mr-1" />
                            <span>Wrong ({{ wrongQuestionsCount }})</span>
                        </button>

                        <!-- End Practice Button -->
                        <button @click="confirmEndPractice"
                            class="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 text-xs"
                            data-umami-event="end-practice-button-click">
                            End
                        </button>
                    </div>
                </div>

                <!-- Desktop Layout -->
                <div class="hidden sm:flex sm:justify-between sm:items-center">
                    <!-- Left side: Timer and Question Counter -->
                    <div class="flex items-center space-x-6">
                        <!-- Timer -->
                        <div v-if="useTimer" class="flex items-center space-x-2 text-gray-700 font-semibold" data-umami-event="timer-display-click">
                            <Icon :icon="timerType === 'countdown' ? 'lucide:timer' : 'lucide:clock'" class="w-5 h-5" />
                            <span class="text-lg">{{ formatTime(timerType === 'countdown' ? remainingTime : elapsedTime) }}</span>
                        </div>

                        <!-- Question Counter with Navigator -->
                        <QuestionNavigator v-if="questions.length > 0" :questions="questions"
                            :currentQuestionIndex="currentQuestionIndex" @go-to-question="goToQuestion"
                            @go-to-previous="goToPrevious" @go-to-next="goToNext" data-umami-event="question-navigator-click" />
                    </div>

                    <!-- Right side: Action buttons -->
                    <div class="flex items-center space-x-4">
                        <!-- Wrong Questions Button -->
                        <button @click="showWrongQuestions = true"
                            class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center text-sm"
                            data-umami-event="wrong-questions-click">
                            <Icon icon="lucide:x-circle" class="w-4 h-4 mr-2" />
                            Wrong Questions ({{ wrongQuestionsCount }})
                        </button>

                        <!-- End Practice Button -->
                        <button @click="confirmEndPractice"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
                            data-umami-event="end-practice-button-click">
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
                                v-model:selectedAnswer="selectedAnswer" v-model:showFeedback="showFeedback"
                                v-model:isCorrect="isCorrect" v-model:explanation="explanation"
                                :sessionStats="sessionStats" @check-answer="checkAnswer" @skip-question="skipQuestion"
                                @next-question="nextQuestion" @go-to-previous="goToPrevious" @go-to-next="goToNext" />
                        </div>
                    </div>

                    <!-- Results Page -->
                    <ResultsPage v-else-if="practiceEnded" :totalQuestions="totalQuestions"
                        :correctAnswers="correctAnswers" :incorrectAnswers="incorrectAnswers" :elapsedTime="elapsedTime"
                        :domainPerformance="domainPerformance" @restart-practice="restartPractice" />
                </div>
            </div>

            <!-- Wrong Questions Manager Modal with improved styling -->
            <div v-if="showWrongQuestions"
                class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                <div class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-800">Wrong Questions Manager</h3>
                        <button
                            @click="showWrongQuestions = false"
                            class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                            data-umami-event="close-wrong-questions-click"
                        >
                            <Icon icon="lucide:x" class="w-4 h-4" />
                        </button>
                    </div>
                    <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
                        <WrongQuestionsManager :isInPracticeMode="false"
                            @start-wrong-questions-practice="startWrongQuestionsPractice"
                            @review-question="reviewQuestion"
                            data-umami-event="wrong-questions-manager-click"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setPracticeMode, allowNavigation } from '../router/index'
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
    getQuestionProgress,
    checkAnswer as checkAnswerUtil,
    saveWrongQuestion,
    onWrongQuestionsUpdate,
    offWrongQuestionsUpdate
} from '../utils/enhancedPracticeUtils'

// Get route and router for navigation
const route = useRoute()
const router = useRouter()

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
const showExitWarning = ref(false)

// Store the selected domains for fallback
const selectedDomains = ref<string[]>([])
const selectedTestType = ref<number>(1)

// Practice mode management with enhanced navigation control
const setPracticeModeActive = (active: boolean) => {
    setPracticeMode(active, () => {
        showExitWarning.value = true
    })
}

const confirmExit = () => {
    showExitWarning.value = false
    setPracticeModeActive(false)
    
    // Allow navigation before redirecting
    allowNavigation()
    
    endPractice()
    router.push('/')
}

const cancelExit = () => {
    showExitWarning.value = false
    // Push current state again to maintain protection
    if (typeof window !== 'undefined') {
        history.pushState(null, '', window.location.pathname)
    }
}

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

// IndexedDB helper functions
const getCompletedQuestions = async (): Promise<string[]> => {
    try {
        const progress = await getQuestionProgress()
        return Object.keys(progress).filter(questionId => progress[questionId].answered)
    } catch (error) {
        console.error('Error getting completed questions:', error)
        return []
    }
}

const clearCompletedQuestions = async () => {
    try {
        console.log('Clear completed questions requested')
    } catch (error) {
        console.error('Error clearing completed questions:', error)
    }
}

// Methods
const updateWrongQuestionsCount = async () => {
    try {
        wrongQuestionsCount.value = (await getWrongQuestions()).length
    } catch (error) {
        console.error('Error updating wrong questions count:', error)
        wrongQuestionsCount.value = 0
    }
}

const handleStartPractice = async (settings: any) => {
    started.value = true
    useTimer.value = settings.useTimer
    timerType.value = settings.timerType
    timerDuration.value = settings.timerDuration
    loading.value = true

    // Activate practice mode protection
    setPracticeModeActive(true)

    // Store selected domains and test type for fallback
    selectedDomains.value = settings.selectedDomains
    selectedTestType.value = settings.selectedTest

    // Reset timer state
    resetTimer()
    elapsedTime.value = 0
    remainingTime.value = settings.timerDuration

    if (settings.resetProgress) {
        await clearCompletedQuestions()
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
        setPracticeModeActive(false)
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

    const completedQuestions = await getCompletedQuestions()
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

// Helper function to determine domain from question data
const determineDomain = (question: any): string => {
    // First, try to use the question's domain field
    if (question.domain && question.domain.trim() !== '') {
        return question.domain
    }

    // If domain is empty, try to infer from selected domains
    if (selectedDomains.value.length === 1) {
        // If only one domain was selected, use that
        return selectedDomains.value[0]
    }

    // Try to infer from test type and question content
    if (selectedTestType.value === 2) {
        // Math test - try to determine specific domain
        const stem = (question.stem || '').toLowerCase()
        const stimulus = (question.stimulus || '').toLowerCase()
        const content = stem + ' ' + stimulus

        if (content.includes('algebra') || content.includes('linear') || content.includes('equation')) {
            return 'H' // Algebra
        } else if (content.includes('function') || content.includes('polynomial') || content.includes('exponential')) {
            return 'P' // Advanced Math
        } else if (content.includes('data') || content.includes('statistics') || content.includes('probability')) {
            return 'Q' // Problem-Solving and Data Analysis
        } else if (content.includes('geometry') || content.includes('trigonometry') || content.includes('triangle')) {
            return 'S' // Geometry and Trigonometry
        } else {
            // Default to first selected math domain or general math
            return selectedDomains.value.find(d => ['H', 'P', 'Q', 'S'].includes(d)) || 'H'
        }
    } else {
        // Reading and Writing test
        const stem = (question.stem || '').toLowerCase()
        const stimulus = (question.stimulus || '').toLowerCase()
        const content = stem + ' ' + stimulus

        if (content.includes('main idea') || content.includes('central claim') || content.includes('purpose')) {
            return 'INI' // Information and Ideas
        } else if (content.includes('structure') || content.includes('craft') || content.includes('word choice')) {
            return 'CAS' // Craft and Structure
        } else if (content.includes('expression') || content.includes('revision') || content.includes('transition')) {
            return 'EOI' // Expression of Ideas
        } else if (content.includes('grammar') || content.includes('punctuation') || content.includes('convention')) {
            return 'SEC' // Standard English Conventions
        } else {
            // Default to first selected English domain or general reading
            return selectedDomains.value.find(d => ['INI', 'CAS', 'EOI', 'SEC'].includes(d)) || 'INI'
        }
    }
}

const checkAnswer = async () => {
    const question = currentQuestion.value

    if (!question || !selectedAnswer.value) {
        console.log('No question or answer to check')
        return
    }

    console.log('Checking answer:', selectedAnswer.value, 'for question:', question.external_id)

    try {
        isCorrect.value = checkAnswerUtil(question, selectedAnswer.value)
        showFeedback.value = true
        explanation.value = question.rationale || ''

        question.userAnswer = selectedAnswer.value
        question.answered = true
        question.isCorrect = isCorrect.value
        question.checked = true

        totalQuestions.value++

        if (isCorrect.value) {
            correctAnswers.value++
        } else {
            incorrectAnswers.value++
            await saveWrongQuestion(question, selectedAnswer.value)
            await updateWrongQuestionsCount()
        }

        const progressData = {
            questionId: question.external_id,
            answered: true,
            isCorrect: isCorrect.value,
            userAnswer: selectedAnswer.value,
            timestamp: Date.now(),
            checked: true
        }

        await saveQuestionProgress(question.external_id, progressData)

        const questionDomain = determineDomain(question)
        updateDomainPerformance(questionDomain, isCorrect.value)

        await new Promise(resolve => setTimeout(resolve, 50))
    } catch (error) {
        console.error('Error checking answer:', error)
        showFeedback.value = true
        explanation.value = question.rationale || 'Explanation not available'
    }
}

const nextQuestion = async () => {
    currentQuestionIndex.value++
    selectedAnswer.value = ''
    showFeedback.value = false
    isCorrect.value = false
    explanation.value = ''
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

        selectedAnswer.value = ''
        showFeedback.value = false
        isCorrect.value = false
        explanation.value = ''

        loading.value = true
        await loadNextQuestion()
        loading.value = false

        try {
            const progress = await getQuestionProgress()
            const savedProgress = progress[nextQ.external_id]

            if (savedProgress && savedProgress.answered) {
                selectedAnswer.value = savedProgress.userAnswer || ''

                if (savedProgress.checked) {
                    isCorrect.value = savedProgress.isCorrect || false
                    explanation.value = nextQ.rationale || ''

                    await new Promise(resolve => setTimeout(resolve, 100))
                    showFeedback.value = true
                }
            }
        } catch (error) {
            console.error('Error loading question progress:', error)
        }
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
    setPracticeModeActive(false)
}

const restartPractice = () => {
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
    selectedDomains.value = []
    selectedTestType.value = 1

    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }

    setPracticeModeActive(false)
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
    // Ensure domain is not empty or undefined
    if (!domain || domain.trim() === '') {
        console.warn('Domain is empty, skipping performance update')
        return
    }

    if (!domainPerformance.value[domain]) {
        // Get domain name from our predefined lists
        const getDomainName = (domainId: string): string => {
            const allDomains = [...englishDomains.value, ...mathDomains.value]
            const domainInfo = allDomains.find(d => d.id === domainId)
            return domainInfo ? domainInfo.name : domainId
        }

        domainPerformance.value[domain] = { 
            id: domain,
            name: getDomainName(domain),
            correct: 0, 
            total: 0 
        }
    }
    
    domainPerformance.value[domain].total++
    if (isCorrect) {
        domainPerformance.value[domain].correct++
    }
}

const startWrongQuestionsPractice = (wrongQuestions: any[]) => {
    questions.value = wrongQuestions.map(wq => ({
        ...wq.question,
        loaded: true,
        userAnswer: wq.userAnswer,
        answered: false,
        isCorrect: false
    }))
    currentQuestionIndex.value = 0
    totalAvailableQuestions.value = questions.value.length
    selectedAnswer.value = ''
    showFeedback.value = false
    showWrongQuestions.value = false
    started.value = true
    practiceEnded.value = false
    setPracticeModeActive(true)
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
    setPracticeModeActive(true)
}

// Load wrong questions from URL query parameters
const loadWrongQuestionsFromQuery = async () => {
    if (route.query.mode === 'wrong-questions' && route.query.questions) {
        try {
            loading.value = true
            const questionIds = JSON.parse(route.query.questions as string)

            if (Array.isArray(questionIds) && questionIds.length > 0) {
                const wrongQuestions = await getWrongQuestions()
                const questionsToLoad = wrongQuestions
                    .filter(wq => questionIds.includes(wq.externalId))

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

            const wrongQuestions = await getWrongQuestions()
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

// Watch for route query changes
watch(() => route.query, (newQuery) => {
    if (newQuery.mode === 'wrong-questions' && newQuery.questions) {
        loadWrongQuestionsFromQuery()
    } else if (newQuery.mode === 'review' && newQuery.questionId) {
        loadReviewQuestionFromQuery()
    }
}, { immediate: false, deep: true })

// Setup reactive wrong questions count updates
onMounted(async () => {
    await updateWrongQuestionsCount()
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
    setPracticeModeActive(false)
    offWrongQuestionsUpdate(updateWrongQuestionsCount)
})
</script>

<style>
.prose img {
    margin: 1rem auto;
    max-width: none;
}

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

    .prose table,
    .prose pre,
    .prose img {
        max-width: none;
    }
}

@media (max-width: 640px) {
    .question-actions button {
        font-size: 0.75rem;
        padding: 0.5rem 1rem;
    }
}

/* Enhanced modal animations */
@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.fixed.inset-0 > div {
    animation: modalFadeIn 0.3s ease-out;
}
</style>