<template>
    <div class="space-y-6">
        <h2 class="text-xl font-bold text-gray-800">Question {{ currentQuestionIndex + 1 }}</h2>
        <div class="prose max-w-none" v-html="renderedQuestion"></div>

        <!-- Multiple Choice Options -->
        <div class="space-y-3">
            <label v-for="option in currentQuestion.answerOptions" :key="option.id" :class="[
                'flex items-start p-3 rounded-lg transition duration-300',
                { 'bg-green-100': showFeedback && isCorrect && selectedAnswer === option.id },
                { 'bg-red-100': showFeedback && !isCorrect && selectedAnswer === option.id },
                { 'bg-gray-100 hover:bg-gray-200': !showFeedback }
            ]">
                <input type="radio" :value="option.id" v-model="localSelectedAnswer" :disabled="showFeedback"
                    class="form-radio text-blue-500 mt-1">
                <span class="ml-3" v-html="renderLatex(option.content)"></span>
            </label>
        </div>

        <div class="flex justify-between">
            <button @click="checkAnswer" :disabled="!localSelectedAnswer || showFeedback"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50">
                Check Answer
            </button>
            <button v-if="!showFeedback" @click="skipQuestion"
                class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-300">
                Skip
            </button>
        </div>

        <!-- Answer Explanation -->
        <div v-if="showFeedback" class="mt-6 space-y-6">
            <p class="font-bold text-2xl" :class="{ 'text-green-600': isCorrect, 'text-red-600': !isCorrect }">
                {{ isCorrect ? 'Correct!' : 'Incorrect.' }}
            </p>

            <div class="bg-white border rounded-lg shadow-sm p-4">
                <h3 class="font-semibold text-lg mb-2">Correct Answer:</h3>
                <p class="text-green-600 font-medium mb-4">
                    {{ currentQuestion.correct_answer[0] }}
                </p>
                <h3 class="font-semibold text-lg mb-2">Your Answer:</h3>
                <p class="mb-4" :class="{ 'text-green-600': isCorrect, 'text-red-600': !isCorrect }">
                    {{ localSelectedAnswer }}
                </p>
                <h3 class="font-semibold text-lg mb-2">Explanation:</h3>
                <div class="prose max-w-none" v-html="renderedExplanation"></div>
            </div>
        </div>

        <button v-if="showFeedback" @click="nextQuestion"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Next Question
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps<{
    currentQuestion: {
        id: string;
        stem: string;
        answerOptions: { id: string; content: string }[];
        correct_answer: string[];
        rationale: string;
    };
    currentQuestionIndex: number;
    selectedAnswer: string;
    showFeedback: boolean;
    isCorrect: boolean;
}>()

const emit = defineEmits(['update:selectedAnswer', 'check-answer', 'skip-question', 'next-question'])

const localSelectedAnswer = ref(props.selectedAnswer)

const renderLatex = (text: string) => {
    if (!text) return ''
    return text.replace(/\$(.*?)\$/g, (match, latex) => {
        try {
            return katex.renderToString(latex, { throwOnError: false })
        } catch (error) {
            console.error('LaTeX rendering error:', error)
            return match
        }
    })
}

const renderedQuestion = computed(() => renderLatex(props.currentQuestion.stem))

const renderedExplanation = computed(() => renderLatex(props.currentQuestion.rationale))

watch(() => props.selectedAnswer, (newValue) => {
    localSelectedAnswer.value = newValue
})

watch(localSelectedAnswer, (newValue) => {
    emit('update:selectedAnswer', newValue)
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
:deep(.katex) {
    font-size: 1.1em;
}
</style>