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
            <label v-for="(option, index) in currentQuestion.answerOptions" :key="option.id" :class="[
                'flex items-start p-3 rounded-lg transition duration-300',
                { 'bg-green-100': showFeedback && isCorrect && selectedAnswer === String.fromCharCode(65 + index) },
                { 'bg-red-100': showFeedback && !isCorrect && selectedAnswer === String.fromCharCode(65 + index) },
                { 'bg-gray-100 hover:bg-gray-200': !showFeedback }
            ]">
                <input type="radio" :value="String.fromCharCode(65 + index)" v-model="localSelectedAnswer"
                    :disabled="showFeedback" class="form-radio text-blue-500 mt-1">
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
        <div v-if="showFeedback" class="mt-6 p-4 rounded-lg bg-gray-50">
            <p class="font-bold mb-2 text-gray-800">
                {{ isCorrect ? 'Correct!' : 'Incorrect.' }}
            </p>
            <div class="prose max-w-none" v-html="formattedRationale"></div>
        </div>
        <button v-if="showFeedback" @click="nextQuestion"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Next Question
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { formatRationale } from '@/utils/practiceUtils'

interface AnswerOption {
    id: string;
    content: string;
}

interface Question {
    type: 'mcq' | 'spr';
    stimulus?: string;
    stem: string;
    image?: string;
    answerOptions?: AnswerOption[];
    rationale: string;
}

export default defineComponent({
    name: 'QuestionArea',
    props: {
        currentQuestion: {
            type: Object as () => Question,
            required: true
        },
        currentQuestionIndex: {
            type: Number,
            required: true
        },
        selectedAnswer: {
            type: String,
            default: ''
        },
        showFeedback: {
            type: Boolean,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    },
    emits: ['update:selectedAnswer', 'check-answer', 'skip-question', 'next-question'],
    setup(props, { emit }) {
        const localSelectedAnswer = ref(props.selectedAnswer)

        watch(() => props.selectedAnswer, (newValue) => {
            localSelectedAnswer.value = newValue
        })

        watch(localSelectedAnswer, (newValue) => {
            emit('update:selectedAnswer', newValue)
        })

        const formattedRationale = computed(() => {
            return formatRationale(props.currentQuestion.rationale)
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

        return {
            localSelectedAnswer,
            formattedRationale,
            checkAnswer,
            skipQuestion,
            nextQuestion
        }
    }
})
</script>