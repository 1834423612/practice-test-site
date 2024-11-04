<template>
    <div class="min-h-screen mt-6">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                <!-- Decorative elements -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-green-200"></div>
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-200 to-blue-200"></div>
                <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-200 to-green-200"></div>
                <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-200 to-blue-200"></div>

                <PracticeSettings v-if="!started" :practiceType="practiceType" :selectedTest="selectedTest"
                    @start-practice="handleStartPractice" />

                <!-- Practice Area -->
                <div v-else>
                    <!-- Header -->
                    <div v-if="!practiceEnded" class="flex justify-between items-center mb-6">
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

                    <!-- Question Area -->
                    <div v-if="!practiceEnded">
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
                    <ResultsPage v-else :totalQuestions="totalQuestions" :correctAnswers="correctAnswers"
                        :incorrectAnswers="incorrectAnswers" :elapsedTime="elapsedTime"
                        :domainPerformance="domainPerformance" :questions="completedQuestions"
                        @restart-practice="restartPractice" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import PracticeSettings from '@/components/PracticeSettings.vue'
import QuestionArea from '@/components/QuestionArea.vue'
import ResultsPage from '@/components/ResultsPage.vue'
import { formatTime } from '@/utils/practiceUtils'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const route = useRoute()
const practiceType = computed(() => route.params.practiceType as 'sat' | 'amc')
const selectedTest = computed(() => {
    const test = route.params.amcType || route.params.testId;
    return Array.isArray(test) ? test[0] : test;
})

// State management
const started = ref(false)
const practiceEnded = ref(false)
const loading = ref(false)
interface Question {
    id: string;
    loaded: boolean;
    type: string;
    stem: string;
    answerOptions: { id: string; content: string }[];
    correct_answer: string[];
    rationale: string;
    domain: string;
    external_id?: string;
}

const questions = ref<Question[]>([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref('')
const showFeedback = ref(false)
const isCorrect = ref(false)
const explanation = ref('')
const totalQuestions = ref(0)
const correctAnswers = ref(0)
const incorrectAnswers = ref(0)
const elapsedTime = ref(0)
const remainingTime = ref(0)
const useTimer = ref(false)
const timerType = ref('stopwatch')
const timerDuration = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const totalAvailableQuestions = ref(0)
interface DomainPerformance {
    [key: string]: { id: string; correct: number; total: number; name: string };
    [key: number]: { id: string; correct: number; total: number; name: string };
}

const domainPerformance = ref<DomainPerformance>({})
interface CompletedQuestion extends Question {
    userAnswer: string;
    isCorrect: boolean;
}

const completedQuestions = ref<CompletedQuestion[]>([])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// Handle practice start
const handleStartPractice = async (settings: { useTimer: boolean; timerType: string; timerDuration: number; resetProgress: any; selectedAssessment: any; selectedTest: any; selectedDomains: any[] }) => {
    started.value = true
    useTimer.value = settings.useTimer
    timerType.value = settings.timerType
    timerDuration.value = settings.timerDuration
    loading.value = true

    if (settings.resetProgress) {
        clearCompletedQuestions()
    }

    try {
        if (practiceType.value === 'sat') {
            await fetchSATQuestions({
                selectedAssessment: settings.selectedAssessment,
                selectedTest: settings.selectedTest,
                selectedDomains: settings.selectedDomains
            })
        } else {
            await fetchAMCQuestions()
        }

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

// Fetch questions based on practice type
const fetchSATQuestions = async (settings: { selectedAssessment: any; selectedTest: any; selectedDomains: any[] }) => {
    const response = await axios.post('https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-questions', {
        asmtEventId: settings.selectedAssessment,
        test: settings.selectedTest,
        domain: settings.selectedDomains.join(',')
    })

    questions.value = response.data
        .filter((q: { external_id: any }) => q.external_id && !getCompletedQuestions().includes(q.external_id))
        .map((q: any) => ({ ...q, loaded: false }))
}

const fetchAMCQuestions = async () => {
    try {
        const response = await axios.get('/src/data/AMC/2023_12A.json')
        if (!response.data?.problems) {
            throw new Error('Invalid AMC question data structure')
        }

        questions.value = response.data.problems.map((q: { id: any; question: any; options: any[]; correct_option: any; solution: any[] }) => ({
            id: q.id,
            loaded: true,
            type: 'mcq',
            stem: renderLatex(q.question),
            answerOptions: q.options.map((option: { label: any; value: any }) => ({
                id: option.label,
                content: renderLatex(option.value)
            })),
            correct_answer: [q.correct_option],
            rationale: Array.isArray(q.solution) ? q.solution.map(renderLatex).join('\n\n') : renderLatex(q.solution),
            domain: 'AMC'
        }))
    } catch (error) {
        console.error('Error fetching AMC questions:', error)
        throw error
    }
}

const renderLatex = (text: string) => {
    return text.replace(/\$(.*?)\$/g, (match: any, latex: any) => {
        try {
            return katex.renderToString(latex, { throwOnError: false })
        } catch (error) {
            console.error('LaTeX rendering error:', error)
            return match
        }
    })
}

// Question navigation and checking
const loadNextQuestion = async () => {
    if (currentQuestionIndex.value >= questions.value.length) {
        endPractice()
        return
    }

    const question = questions.value[currentQuestionIndex.value]
    if (!question.loaded && practiceType.value === 'sat') {
        try {
            const response = await axios.post('https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-question', {
                external_id: question.external_id
            })
            Object.assign(question, response.data, { loaded: true })
        } catch (error) {
            console.error('Error loading question:', error)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'There was an error loading the question. Please try again.',
            })
        }
    }
}

const checkAnswer = () => {
    const question = currentQuestion.value

    if (practiceType.value === 'sat') {
        if (question.type === 'mcq') {
            isCorrect.value = selectedAnswer.value === question.correct_answer[0]
        } else if (question.type === 'spr') {
            isCorrect.value = question.correct_answer.some((answer: string) => {
                const userAnswer = selectedAnswer.value.trim().toLowerCase()
                return userAnswer === answer.trim().toLowerCase() ||
                    (parseFloat(userAnswer) === parseFloat(answer) && !isNaN(parseFloat(userAnswer)))
            })
        }
        explanation.value = question.rationale
    } else {
        isCorrect.value = selectedAnswer.value === question.correct_answer[0]
        explanation.value = question.rationale
    }

    showFeedback.value = true
    totalQuestions.value++

    if (isCorrect.value) {
        correctAnswers.value++
    } else {
        incorrectAnswers.value++
    }

    updateDomainPerformance(question.domain, isCorrect.value)
    saveCompletedQuestion(question)
}

// Timer management
const startTimer = () => {
    if (timerType.value === 'countdown') {
        remainingTime.value = timerDuration.value
    }

    timerInterval.value = setInterval(() => {
        if (timerType.value === 'stopwatch') {
            elapsedTime.value++
        } else {
            remainingTime.value--
            if (remainingTime.value <= 0) {
                endPractice()
            }
        }
    }, 1000)
}

// Practice flow control
const skipQuestion = () => nextQuestion()

const nextQuestion = async () => {
    showFeedback.value = false
    isCorrect.value = false
    explanation.value = ''
    selectedAnswer.value = ''
    currentQuestionIndex.value++
    await loadNextQuestion()
}

const endPractice = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
    }
    practiceEnded.value = true
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

const restartPractice = () => {
    started.value = false
    practiceEnded.value = false
    currentQuestionIndex.value = 0
    totalQuestions.value = 0
    correctAnswers.value = 0
    incorrectAnswers.value = 0
    elapsedTime.value = 0
    remainingTime.value = 0
    domainPerformance.value = {}
    questions.value = []
    completedQuestions.value = []
}

// Progress management
const updateDomainPerformance = (domain: string | number, isCorrect: boolean) => {
    if (!domainPerformance.value[domain]) {
        domainPerformance.value[domain] = { id: String(domain), correct: 0, total: 0, name: String(domain) }
    }
    domainPerformance.value[domain].total++
    if (isCorrect) {
        domainPerformance.value[domain].correct++
    }
}

const saveCompletedQuestion = (question: Question) => {
    completedQuestions.value.push({
        ...question,
        userAnswer: selectedAnswer.value,
        isCorrect: isCorrect.value
    })
    saveProgress()
}

const saveProgress = () => {
    const practiceState = {
        currentQuestionIndex: currentQuestionIndex.value,
        completedQuestions: completedQuestions.value,
        domainPerformance: domainPerformance.value,
        elapsedTime: elapsedTime.value,
        remainingTime: remainingTime.value,
        totalQuestions: totalQuestions.value,
        correctAnswers: correctAnswers.value,
        incorrectAnswers: incorrectAnswers.value
    }
    localStorage.setItem('practiceState', JSON.stringify(practiceState))
}

const loadProgress = () => {
    const savedState = localStorage.getItem('practiceState')
    if (savedState) {
        const parsedState = JSON.parse(savedState)
        Object.assign(currentQuestionIndex, { value: parsedState.currentQuestionIndex })
        Object.assign(completedQuestions, { value: parsedState.completedQuestions })
        Object.assign(domainPerformance, { value: parsedState.domainPerformance })
        Object.assign(elapsedTime, { value: parsedState.elapsedTime })
        Object.assign(remainingTime, { value: parsedState.remainingTime })
        Object.assign(totalQuestions, { value: parsedState.totalQuestions })
        Object.assign(correctAnswers, { value: parsedState.correctAnswers })
        Object.assign(incorrectAnswers, { value: parsedState.incorrectAnswers })
    }
}

const clearCompletedQuestions = () => {
    localStorage.removeItem('practiceState')
    completedQuestions.value = []
    domainPerformance.value = {}
    elapsedTime.value = 0
    remainingTime.value = 0
    totalQuestions.value = 0
    correctAnswers.value = 0
    incorrectAnswers.value = 0
}

const getCompletedQuestions = () => {
    return completedQuestions.value
        .filter(q => 'external_id' in q)
        .map(q => q.external_id)
}

// Lifecycle hooks
onMounted(() => {
    loadProgress()
})

onUnmounted(() => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
    }
})

watch(elapsedTime, () => {
    saveProgress()
})
</script>

<style>
.prose img {
    margin: 1rem auto;
}
</style>