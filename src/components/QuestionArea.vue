<template>
    <div class="space-y-6">
        <h2 class="text-xl font-bold text-gray-800">Question {{ currentQuestionIndex + 1 }}</h2>
        <div v-if="currentQuestion.stimulus" class="prose max-w-none bg-gray-50 p-4 rounded-lg"
            v-html="currentQuestion.stimulus"></div>
        <div class="prose max-w-none" v-html="currentQuestion.stem"></div>
        <div v-if="currentQuestion.image" class="my-4">
            <img :src="currentQuestion.image" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md">
        </div>

        <!-- Multiple Choice Question -->
        <div v-if="currentQuestion.type === 'mcq'" class="space-y-3">
            <label v-for="option in currentQuestion.answerOptions" :key="option.id" :class="[
                'flex items-start p-3 rounded-lg transition duration-300',
                { 'bg-green-100': showFeedback && isCorrect && selectedAnswer === option.id },
                { 'bg-red-100': showFeedback && !isCorrect && selectedAnswer === option.id },
                { 'bg-gray-100 hover:bg-gray-200': !showFeedback }
            ]">
                <input type="radio" :value="option.id" v-model="localSelectedAnswer" :disabled="showFeedback"
                    class="form-radio text-blue-500 mt-1">
                <span class="ml-3" v-html="option.content"></span>
            </label>
        </div>

        <!-- Fill in the Blank / Short Answer Question -->
        <div v-else-if="currentQuestion.type === 'spr'" class="space-y-3">
            <input type="text" v-model="localSelectedAnswer" :disabled="showFeedback"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your answer">
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

        <!-- Improved Answer Explanation -->
        <div v-if="showFeedback" class="mt-6 space-y-6">
            <p class="font-bold text-2xl" :class="{ 'text-green-600': isCorrect, 'text-red-600': !isCorrect }">
                {{ isCorrect ? 'Correct!' : 'Incorrect.' }}
            </p>

            <!-- MCQ Explanation -->
            <template v-if="currentQuestion.type === 'mcq'">
                <div v-for="(explanation, index) in parsedMCQExplanation" :key="index"
                    class="bg-white border rounded-lg shadow-sm p-4 transition-all duration-300" :class="{
                        'border-green-500': explanation.isCorrect,
                        'border-red-500': !explanation.isCorrect && explanation.isSelected,
                        'border-gray-300': !explanation.isCorrect && !explanation.isSelected
                    }">
                    <h3 class="font-semibold text-lg mb-2" :class="{
                        'text-green-600': explanation.isCorrect,
                        'text-red-600': !explanation.isCorrect && explanation.isSelected,
                        'text-gray-700': !explanation.isCorrect && !explanation.isSelected
                    }">
                        Choice {{ explanation.letter }}
                        <span v-if="explanation.isCorrect">(Correct Answer)</span>
                        <span v-if="explanation.isSelected && !explanation.isCorrect" class="text-red-600">(Your
                            Incorrect Answer)</span>
                        <span v-else-if="explanation.isSelected">(Your Answer)</span>
                    </h3>
                    <div class="prose max-w-none"
                        :class="{ 'text-red-600': !explanation.isCorrect && explanation.isSelected }"
                        v-html="explanation.content"></div>
                </div>
            </template>

            <!-- SPR Explanation -->
            <template v-else-if="currentQuestion.type === 'spr'">
                <div class="bg-white border rounded-lg shadow-sm p-4">
                    <h3 class="font-semibold text-lg mb-2">Correct Answer(s):</h3>
                    <ul class="list-disc list-inside mb-4">
                        <li v-for="(answer, index) in currentQuestion.correct_answer" :key="index"
                            class="text-green-600 font-medium">
                            {{ answer }}
                        </li>
                    </ul>
                    <h3 class="font-semibold text-lg mb-2">Your Answer:</h3>
                    <p class="mb-4" :class="{ 'text-green-600': isCorrect, 'text-red-600': !isCorrect }">
                        {{ localSelectedAnswer }}
                    </p>
                    <h3 class="font-semibold text-lg mb-2">Explanation:</h3>
                    <div class="prose max-w-none" v-html="explanation"></div>
                </div>
            </template>
        </div>

        <button v-if="showFeedback" @click="nextQuestion"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Next Question
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
    currentQuestion: any;
    currentQuestionIndex: number;
    selectedAnswer: string;
    showFeedback: boolean;
    isCorrect: boolean;
    explanation: string;
}>()

const emit = defineEmits(['update:selectedAnswer', 'check-answer', 'skip-question', 'next-question'])

const localSelectedAnswer = ref(props.selectedAnswer)

const parsedMCQExplanation = computed(() => {
    if (props.currentQuestion.type !== 'mcq' || !props.explanation) return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(props.explanation, 'text/html')
    const paragraphs = Array.from(doc.querySelectorAll('p'))

    return paragraphs.map((p) => {
        const text = p.textContent || ''
        const choiceMatch = text.match(/^Choice ([A-D]) is/)
        const letter = choiceMatch ? choiceMatch[1] : ''

        const optionId = props.currentQuestion.answerOptions.find((option: { content: string | string[]; }) =>
            option.content.includes(`<p>${letter}.`) ||
            option.content.includes(`<p>${letter})`)
        )?.id

        return {
            letter,
            content: p.outerHTML,
            isCorrect: text.includes('is correct'),
            isSelected: props.selectedAnswer === optionId
        }
    }).filter(explanation => explanation.letter)
})

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