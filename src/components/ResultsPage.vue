<template>
    <div>
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Practice Summary</h2>
        <div class="space-y-6">
            <div class="bg-blue-50 p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Overall Performance</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Total Questions</p>
                        <p class="text-2xl font-bold text-gray-800">{{ totalQuestions }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Accuracy</p>
                        <p class="text-2xl font-bold text-gray-800">{{ accuracy }}%</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Correct Answers</p>
                        <p class="text-2xl font-bold text-green-600">{{ correctAnswers }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Incorrect Answers</p>
                        <p class="text-2xl font-bold text-red-600">{{ incorrectAnswers }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-green-50 p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Time Performance</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Total Time</p>
                        <p class="text-2xl font-bold text-gray-800">{{ formattedTotalTime }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Avg. Time per Question</p>
                        <p class="text-2xl font-bold text-gray-800">{{ formattedAvgTimePerQuestion }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-purple-50 p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Domain Performance</h3>
                <div class="space-y-4">
                    <div v-for="domain in domainPerformance" :key="domain.id" class="flex justify-between items-center">
                        <span class="text-gray-700">{{ domain.name }}</span>
                        <div class="flex items-center">
                            <span class="text-sm font-medium text-gray-600 mr-2">{{ domain.correct }}/{{ domain.total
                                }}</span>
                            <div class="w-20 bg-gray-200 rounded-full h-2.5">
                                <div class="bg-blue-600 h-2.5 rounded-full"
                                    :style="{ width: `${(domain.correct / domain.total) * 100}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button @click="$emit('restart-practice')"
            class="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300">
            Start New Practice
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { formatTime } from '@/utils/practiceUtils'

interface DomainPerformance {
    id: string;
    name: string;
    correct: number;
    total: number;
}

export default defineComponent({
    name: 'ResultsPage',
    props: {
        totalQuestions: {
            type: Number,
            required: true
        },
        correctAnswers: {
            type: Number,
            required: true
        },
        incorrectAnswers: {
            type: Number,
            required: true
        },
        elapsedTime: {
            type: Number,
            required: true
        },
        domainPerformance: {
            type: Object as () => Record<string, DomainPerformance>,
            required: true
        }
    },
    emits: ['restart-practice'],
    setup(props) {
        const accuracy = computed(() => {
            return props.totalQuestions > 0
                ? ((props.correctAnswers / props.totalQuestions) * 100).toFixed(2)
                : 0
        })
        const formattedTotalTime = computed(() => {
            return formatTime(props.elapsedTime)
        })
        const formattedAvgTimePerQuestion = computed(() => {
            const avgTime = props.totalQuestions > 0 ? Math.round(props.elapsedTime / props.totalQuestions) : 0
            return formatTime(avgTime)
        })
        return {
            accuracy,
            formattedTotalTime,
            formattedAvgTimePerQuestion
        }
    }
})
</script>