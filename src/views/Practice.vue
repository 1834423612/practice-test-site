<template>
    <div class="min-h-screen mt-6">
        <div class="max-w-4xl mx-auto">
            <!-- Header with Timer, Total Questions, and End Practice Button -->
            <div v-if="started && !practiceEnded" class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-4">
                    <div v-if="useTimer" class="text-gray-700 font-semibold">
                        <Icon :icon="timerType === 'countdown' ? 'mdi:timer-sand' : 'mdi:timer-outline'"
                            class="inline-block mr-2" />
                        {{ formatTime(timerType === 'countdown' ? remainingTime : elapsedTime) }}
                    </div>
                    <div class="text-gray-700 font-semibold">
                        <Icon icon="mdi:file-document-multiple-outline" class="inline-block mr-2" />
                        {{ currentQuestionIndex + 1 }} / {{ totalAvailableQuestions }}
                    </div>
                </div>
                <button @click="confirmEndPractice"
                    class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    End Practice
                </button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                <!-- Decorative elements -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-green-200"></div>
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-200 to-blue-200"></div>
                <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-200 to-green-200"></div>
                <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-200 to-blue-200"></div>

                <PracticeSettings v-if="!started" :assessmentTypes="assessmentTypes" :testTypes="testTypes"
                    :englishDomains="englishDomains" :mathDomains="mathDomains" @start-practice="handleStartPractice" />

                <!-- Practice Area -->
                <div v-else-if="!practiceEnded">
                    <!-- Question Area -->
                    <div v-if="loading" class="text-center py-12">
                        <Icon icon="mdi:loading" class="animate-spin text-4xl text-blue-500" />
                        <p class="mt-2 text-gray-700">Loading question...</p>
                    </div>
                    <QuestionArea v-else-if="currentQuestion" :currentQuestion="currentQuestion"
                        :currentQuestionIndex="currentQuestionIndex" v-model:selectedAnswer="selectedAnswer"
                        :showFeedback="showFeedback" :isCorrect="isCorrect" :explanation="explanation"
                        @check-answer="checkAnswer" @skip-question="skipQuestion" @next-question="nextQuestion" />
                </div>

                <!-- Results Page -->
                <ResultsPage v-else-if="practiceEnded" :totalQuestions="totalQuestions" :correctAnswers="correctAnswers"
                    :incorrectAnswers="incorrectAnswers" :elapsedTime="elapsedTime"
                    :domainPerformance="domainPerformance" @restart-practice="restartPractice" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import PracticeSettings from '@/components/PracticeSettings.vue'
import QuestionArea from '@/components/QuestionArea.vue'
import ResultsPage from '@/components/ResultsPage.vue'
import { formatTime } from '@/utils/practiceUtils'
import type { AssessmentType, TestType, Domain, Question, DomainPerformance, PracticeState } from '@/types'

// Component logic
const assessmentTypes = ref<AssessmentType[]>([
    { id: 100, name: 'PSAT/NMSQT & PSAT 10' },
    { id: 99, name: 'SAT' },
    { id: 102, name: 'PSAT 8/9' }
])

const testTypes = ref<TestType[]>([
    { id: 1, name: 'Reading and Writing' },
    { id: 2, name: 'Math' }
])

const englishDomains = ref<Domain[]>([
    { id: 'INI', name: 'Information and Ideas' },
    { id: 'CAS', name: 'Craft and Structure' },
    { id: 'EOI', name: 'Expression of Ideas' },
    { id: 'SEC', name: 'Standard English Conventions' }
])

const mathDomains = ref<Domain[]>([
    { id: 'H', name: 'Algebra' },
    { id: 'P', name: 'Advanced Math' },
    { id: 'Q', name: 'Problem-Solving and Data Analysis' },
    { id: 'S', name: 'Geometry and Trigonometry' }
])

const started = ref(false)
const useTimer = ref(false)
const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
const timerDuration = ref(134 * 60)
const elapsedTime = ref(0)
const remainingTime = ref(0)
const timerInterval = ref<number | null>(null)
const totalAvailableQuestions = ref(0)
const loading = ref(false)
const questions = ref<Question[]>([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref('')
const explanation = ref('')
const showFeedback = ref(false)
const isCorrect = ref(false)
const practiceEnded = ref(false)
const totalQuestions = ref(0)
const correctAnswers = ref(0)
const incorrectAnswers = ref(0)
const domainPerformance = ref<Record<string, DomainPerformance>>({})

const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value]
})

const handleStartPractice = async (settings: {
    selectedAssessment: number;
    selectedTest: number;
    selectedDomains: string[];
    useTimer: boolean;
    timerType: 'stopwatch' | 'countdown';
    timerDuration: number;
    resetProgress: boolean;
}) => {
    started.value = true
    useTimer.value = settings.useTimer
    timerType.value = settings.timerType
    timerDuration.value = settings.timerDuration
    loading.value = true

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
    questions.value = response.data
        .filter((q: { external_id: string | null }) => q.external_id && !getCompletedQuestions().includes(q.external_id))
        .map((q: Question) => ({ ...q, loaded: false }))
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
    if (question.type === 'mcq') {
        const correctAnswerIndex = question.correct_answer[0].charCodeAt(0) - 65
        const correctAnswerId = question.answerOptions?.[correctAnswerIndex]?.id ?? ''
        isCorrect.value = selectedAnswer.value === correctAnswerId
    } else if (question.type === 'spr') {
        isCorrect.value = question.correct_answer.some(answer => {
            const userAnswer = selectedAnswer.value.trim().toLowerCase()
            return userAnswer === answer.trim().toLowerCase() ||
                (parseFloat(userAnswer) === parseFloat(answer) && !isNaN(parseFloat(userAnswer)))
        })
    }
    showFeedback.value = true
    explanation.value = question.rationale // Use the rationale directly from the API response
    totalQuestions.value++
    if (isCorrect.value) {
        correctAnswers.value++
    } else {
        incorrectAnswers.value++
    }
    updateDomainPerformance(question.domain, isCorrect.value)
    saveCompletedQuestion(question.external_id)
}

watch(currentQuestionIndex, () => {
    isCorrect.value = false
    showFeedback.value = false
    selectedAnswer.value = ''
})

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
    }
    practiceEnded.value = true
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
    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
    }
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

// Save practice state to local storage
const savePracticeState = () => {
    const state: PracticeState = {
        currentQuestionIndex: currentQuestionIndex.value,
        elapsedTime: elapsedTime.value,
        remainingTime: remainingTime.value,
        totalQuestions: totalQuestions.value,
        correctAnswers: correctAnswers.value,
        incorrectAnswers: incorrectAnswers.value,
        domainPerformance: domainPerformance.value
    }
    localStorage.setItem('practiceState', JSON.stringify(state))
}

// Load practice state from local storage
const loadPracticeState = () => {
    const savedState = localStorage.getItem('practiceState')
    if (savedState) {
        const state: PracticeState = JSON.parse(savedState)
        currentQuestionIndex.value = state.currentQuestionIndex
        elapsedTime.value = state.elapsedTime
        remainingTime.value = state.remainingTime
        totalQuestions.value = state.totalQuestions
        correctAnswers.value = state.correctAnswers
        incorrectAnswers.value = state.incorrectAnswers
        domainPerformance.value = state.domainPerformance
    }
}

// Save state every 5 seconds
const autoSaveInterval = setInterval(savePracticeState, 5000)

onMounted(() => {
    loadPracticeState()
})

onUnmounted(() => {
    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value)
    }
    clearInterval(autoSaveInterval)
})
</script>

<style>
.prose img {
    margin: 1rem auto;
}
</style>