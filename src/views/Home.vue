<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="relative max-w-md w-full bg-white p-2 rounded-xl shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"></div>
            <div class="relative bg-white rounded-xl p-8">
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Select Practice Type
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Choose the type of practice you'd like to do
                </p>
                <div class="mt-8 space-y-6">
                    <div class="space-y-4">
                        <button v-for="practiceType in practiceTypes" :key="practiceType.id"
                            @click="selectPracticeType(practiceType)"
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
                            {{ practiceType.name }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const practiceTypes = ref([
    { id: 'sat', name: 'SAT Series' },
    { id: 'amc', name: 'AMC Series' }
])

const selectPracticeType = (practiceType: { id: string, name: string }) => {
    router.push({
        name: 'PracticeSelection',
        params: { practiceType: practiceType.id }
    })
}
</script>