<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-md p-8 relative overflow-hidden">
                <!-- Decorative elements -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-green-400"></div>
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
                <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-green-400"></div>
                <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-400 to-blue-400"></div>

                <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">About Our Practice Test Platform</h1>

                <div class="space-y-8">
                    <section class="bg-blue-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-blue-700 mb-4">Features</h2>
                        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li v-for="feature in features" :key="feature" class="flex items-start">
                                <Icon icon="mdi:check-circle" class="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <span class="text-gray-700">{{ feature }}</span>
                            </li>
                        </ul>
                    </section>

                    <section class="bg-green-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-green-700 mb-4">How It Works</h2>
                        <ol class="list-decimal list-inside text-gray-700 space-y-2">
                            <li>Select your exam type (PSAT/NMSQT & PSAT 10, SAT, or PSAT 8/9)</li>
                            <li>Choose the specific test sections you want to practice</li>
                            <li>Set your preferred timer options</li>
                            <li>Start your personalized practice session</li>
                            <li>Receive instant feedback and review your results</li>
                        </ol>
                    </section>

                    <section class="bg-yellow-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-yellow-700 mb-4">Question Bank Copyright</h2>
                        <p class="text-gray-700">
                            All the questions in this website are sourced/collected from publicly available <a href="https://collegeboard.org/" target="_blank" class="text-blue-500">
                            College Board</a> practice tests. We acknowledge and respect the copyright of College Board for these
                            materials.
                        </p>
                    </section>

                    <section class="bg-purple-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-purple-700 mb-4">Project Repository</h2>
                        <p class="text-gray-700 mb-2">
                            This project is open-source and available on GitHub. You can find the source code,
                            contribute, or report issues at Github:
                        </p>
                        <a href="https://github.com/1834423612/practice-test-site" target="_blank"
                            rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center">
                            <Icon icon="mdi:github" class="mr-2" />
                            <b>Practice Test Site Repository</b>
                        </a>
                    </section>

                    <section class="bg-indigo-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-indigo-700 mb-4">Contact Me</h2>
                        <p class="text-gray-700 mb-2">
                            Have some questions? Contact me:
                        </p>
                        <p class="text-blue-600 font-semibold">admin@kjchmc.cn</p>
                        <p class="text-blue-600 font-semibold">KevinKuang2007@gmail.com</p>
                    </section>

                    <section class="bg-pink-50 rounded-lg p-6 shadow-sm">
                        <h2 class="text-2xl font-semibold text-pink-700 mb-4">About Me</h2>
                        <p class="text-gray-700 mb-2">
                            This practice test platform was created by kjch. To learn more about me and my
                            other projects, visit:
                        </p>
                        <a href="https://www.kjchmc.cn" target="_blank" rel="noopener noreferrer"
                            class="text-blue-600 hover:underline flex items-center">
                            <Icon icon="mdi:web" class="mr-2" />
                            <b>kjch's Website</b>(CN was the original language for this website)
                        </a>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const features = [
    'Comprehensive question bank',
    'Customizable practice sessions',
    'Timed practice options',
    'Detailed performance analytics',
    'Progress tracking',
    'Immediate feedback',
    'Explanations for each question'
]
</script>
