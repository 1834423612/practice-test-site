<template>
    <div
        class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Select {{ practiceType.toUpperCase() }} Test
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Choose the specific test you'd like to practice
                </p>
            </div>
            <div class="mt-8 space-y-6">
                <div class="space-y-4">
                    <button v-for="test in tests" :key="test.id" @click="selectTest(test)"
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                aria-hidden="true">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </span>
                        {{ test.name }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const practiceType = computed(() => route.params.practiceType as string)

const satTests = [
    { id: 1, name: 'PSAT/NMSQT', asmtEventId: 100 },
    { id: 2, name: 'SAT', asmtEventId: 99 },
    { id: 3, name: 'PSAT 8/9', asmtEventId: 102 }
]

const amcTests = [
    { id: 'AMC_8', name: 'AMC 8' },
    { id: 'AMC_10', name: 'AMC 10' },
    { id: 'AMC_12', name: 'AMC 12' }
]

const tests = computed(() => practiceType.value === 'sat' ? satTests : amcTests)

const selectTest = (test: { id: number | string, name: string, asmtEventId?: number }) => {
    if (practiceType.value === 'sat') {
        localStorage.setItem('selectedAsmtEventId', test.asmtEventId!.toString())
        router.push({
            name: 'Practice',
            params: {
                practiceType: practiceType.value,
                testId: test.id.toString(),
                asmtEventId: test.asmtEventId!.toString()
            }
        })
    } else {
        router.push({
            name: 'Practice',
            params: {
                practiceType: practiceType.value,
                amcType: test.id.toString()
            }
        })
    }
}
</script>