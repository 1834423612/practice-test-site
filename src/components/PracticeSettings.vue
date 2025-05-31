<template>
    <div class="max-w-4xl mx-auto">
        <!-- Progress Indicator -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
                <h2
                    class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Practice Settings
                </h2>
                <div class="text-sm text-gray-500">
                    Step {{ step }} of 5
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: `${(step / 5) * 100}%` }"></div>
            </div>
        </div>

        <!-- Step 1: Assessment Type -->
        <div v-if="step === 1" class="space-y-6">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">Choose Your Assessment</h3>
                <p class="text-gray-600">Select the type of test you want to practice</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="test in assessmentTypes" :key="test.id" @click="selectAssessment(test.id)"
                    class="group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    :class="selectedAssessment === test.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-300'">
                    <div class="p-6 text-center">
                        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            :class="selectedAssessment === test.id ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'">
                            <Icon icon="lucide:graduation-cap"
                                :class="selectedAssessment === test.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'"
                                class="w-8 h-8" />
                        </div>
                        <h4 class="font-semibold text-lg text-gray-800 mb-2">{{ test.name }}</h4>
                        <div v-if="selectedAssessment === test.id"
                            class="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Icon icon="lucide:check" class="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-6">
                <button @click="nextStep" :disabled="!selectedAssessment"
                    class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Continue
                    <Icon icon="lucide:arrow-right" class="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Step 2: Test Type -->
        <div v-if="step === 2" class="space-y-6">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">Select Test Section</h3>
                <p class="text-gray-600">Choose which section you'd like to practice</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="test in testTypes" :key="test.id" @click="selectTest(test.id)"
                    class="group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    :class="selectedTest === test.id
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300'">
                    <div class="p-8 text-center">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                            :class="selectedTest === test.id ? 'bg-green-500' : 'bg-gray-100 group-hover:bg-green-100'">
                            <Icon :icon="test.id === 1 ? 'lucide:book-open' : 'lucide:calculator'"
                                :class="selectedTest === test.id ? 'text-white' : 'text-gray-600 group-hover:text-green-600'"
                                class="w-10 h-10" />
                        </div>
                        <h4 class="font-semibold text-xl text-gray-800">{{ test.name }}</h4>
                        <div v-if="selectedTest === test.id"
                            class="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Icon icon="lucide:check" class="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between pt-6">
                <button @click="prevStep"
                    class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300">
                    <Icon icon="lucide:arrow-left" class="mr-2 w-4 h-4" />
                    Back
                </button>
                <button @click="nextStep" :disabled="!selectedTest"
                    class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Continue
                    <Icon icon="lucide:arrow-right" class="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Step 3: Domains -->
        <div v-if="step === 3" class="space-y-6">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">Choose Topics</h3>
                <p class="text-gray-600">Select the specific areas you want to focus on</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-lg font-medium text-gray-800">Available Topics</span>
                    <button @click="toggleAllDomains"
                        class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                        {{ selectAllDomains ? 'Deselect All' : 'Select All' }}
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="domain in availableDomains" :key="domain.id" @click="toggleDomain(domain.id)"
                        class="group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md"
                        :class="selectedDomains.includes(domain.id)
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                            : 'border-gray-200 bg-white hover:border-purple-300'">
                        <div class="p-4 flex items-center">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                                :class="selectedDomains.includes(domain.id) ? 'bg-purple-500' : 'bg-gray-100 group-hover:bg-purple-100'">
                                <Icon icon="lucide:target"
                                    :class="selectedDomains.includes(domain.id) ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'"
                                    class="w-5 h-5" />
                            </div>
                            <span class="font-medium text-gray-800">{{ domain.name }}</span>
                            <div v-if="selectedDomains.includes(domain.id)"
                                class="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Icon icon="lucide:check" class="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between pt-6">
                <button @click="prevStep"
                    class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300">
                    <Icon icon="lucide:arrow-left" class="mr-2 w-4 h-4" />
                    Back
                </button>
                <button @click="nextStep" :disabled="selectedDomains.length === 0"
                    class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Continue
                    <Icon icon="lucide:arrow-right" class="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Step 4: Timer Settings -->
        <div v-if="step === 4" class="space-y-6">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">Timer Preferences</h3>
                <p class="text-gray-600">Configure your practice session timing</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div class="space-y-6">
                    <!-- Timer Toggle -->
                    <div @click="toggleTimer"
                        class="group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md"
                        :class="useTimer
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'">
                        <div class="p-6 flex items-center">
                            <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                                :class="useTimer ? 'bg-orange-500' : 'bg-gray-100 group-hover:bg-orange-100'">
                                <Icon icon="lucide:timer"
                                    :class="useTimer ? 'text-white' : 'text-gray-600 group-hover:text-orange-600'"
                                    class="w-6 h-6" />
                            </div>
                            <div>
                                <h4 class="font-semibold text-lg text-gray-800">Use Timer</h4>
                                <p class="text-gray-600">Track your practice session time</p>
                            </div>
                            <div v-if="useTimer"
                                class="ml-auto w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Icon icon="lucide:check" class="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    <!-- Timer Type Selection -->
                    <div v-if="useTimer" class="space-y-4">
                        <h4 class="font-medium text-gray-800">Timer Type</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div @click="setTimerType('stopwatch')"
                                class="group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md"
                                :class="timerType === 'stopwatch'
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                                    : 'border-gray-200 bg-white hover:border-blue-300'">
                                <div class="p-4 flex items-center">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                        :class="timerType === 'stopwatch' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'">
                                        <Icon icon="lucide:play"
                                            :class="timerType === 'stopwatch' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'"
                                            class="w-5 h-5" />
                                    </div>
                                    <span class="font-medium text-gray-800">Stopwatch</span>
                                    <div v-if="timerType === 'stopwatch'"
                                        class="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Icon icon="lucide:check" class="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div @click="setTimerType('countdown')"
                                class="group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md"
                                :class="timerType === 'countdown'
                                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50'
                                    : 'border-gray-200 bg-white hover:border-red-300'">
                                <div class="p-4 flex items-center">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                        :class="timerType === 'countdown' ? 'bg-red-500' : 'bg-gray-100 group-hover:bg-red-100'">
                                        <Icon icon="lucide:clock"
                                            :class="timerType === 'countdown' ? 'text-white' : 'text-gray-600 group-hover:text-red-600'"
                                            class="w-5 h-5" />
                                    </div>
                                    <span class="font-medium text-gray-800">Countdown</span>
                                    <div v-if="timerType === 'countdown'"
                                        class="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <Icon icon="lucide:check" class="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Duration Selection -->
                        <div v-if="timerType === 'countdown'" class="space-y-3">
                            <h4 class="font-medium text-gray-800">Duration</h4>
                            <select v-model="timerDuration"
                                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white">
                                <option :value="134 * 60">PSAT Standard Time (2h 14min)</option>
                                <option :value="201 * 60">PSAT 50% Extended Time (3h 21min)</option>
                                <option :value="268 * 60">PSAT 100% Extended Time (4h 28min)</option>
                                <option :value="30 * 60">30 minutes</option>
                                <option :value="60 * 60">60 minutes</option>
                                <option :value="90 * 60">90 minutes</option>
                                <option :value="120 * 60">120 minutes</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between pt-6">
                <button @click="prevStep"
                    class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300">
                    <Icon icon="lucide:arrow-left" class="mr-2 w-4 h-4" />
                    Back
                </button>
                <button @click="nextStep"
                    class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Continue
                    <Icon icon="lucide:arrow-right" class="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Step 5: Final Settings -->
        <div v-if="step === 5" class="space-y-6">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">Final Settings</h3>
                <p class="text-gray-600">Review and start your practice session</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <!-- Reset Progress Option -->
                <div @click="toggleResetProgress"
                    class="group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md mb-6"
                    :class="resetProgress
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300'">
                    <div class="p-6 flex items-start">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                            :class="resetProgress ? 'bg-indigo-500' : 'bg-gray-100 group-hover:bg-indigo-100'">
                            <Icon icon="lucide:refresh-cw"
                                :class="resetProgress ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'"
                                class="w-6 h-6" />
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg text-gray-800 mb-2">Reset Progress</h4>
                            <p class="text-gray-600">Include previously completed questions in this session</p>
                        </div>
                        <div v-if="resetProgress"
                            class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon icon="lucide:check" class="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <!-- Settings Summary -->
                <div class="bg-gray-50 rounded-xl p-6">
                    <h4 class="font-semibold text-lg text-gray-800 mb-4">Session Summary</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Assessment:</span>
                            <span class="font-medium text-gray-800">{{ getAssessmentName() }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Section:</span>
                            <span class="font-medium text-gray-800">{{ getTestName() }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Topics:</span>
                            <span class="font-medium text-gray-800">{{ selectedDomains.length }} selected</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Timer:</span>
                            <span class="font-medium text-gray-800">{{ getTimerDescription() }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between pt-6">
                <button @click="prevStep"
                    class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300">
                    <Icon icon="lucide:arrow-left" class="mr-2 w-4 h-4" />
                    Back
                </button>
                <button @click="startPractice"
                    class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <Icon icon="lucide:play" class="mr-2 w-4 h-4" />
                    Start Practice
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface AssessmentType {
    id: number
    name: string
}

interface TestType {
    id: number
    name: string
}

interface Domain {
    id: string
    name: string
}

const props = defineProps<{
    assessmentTypes: AssessmentType[]
    testTypes: TestType[]
    englishDomains: Domain[]
    mathDomains: Domain[]
}>()

const emit = defineEmits<{
    'start-practice': [settings: {
        selectedAssessment: number
        selectedTest: number
        selectedDomains: string[]
        useTimer: boolean
        timerType: 'stopwatch' | 'countdown'
        timerDuration: number
        resetProgress: boolean
    }]
}>()

const step = ref(1)
const selectedAssessment = ref<number | null>(null)
const selectedTest = ref<number | null>(null)
const selectedDomains = ref<string[]>([])
const selectAllDomains = ref(false)
const useTimer = ref(false)
const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
const timerDuration = ref(134 * 60)
const resetProgress = ref(false)

const availableDomains = computed(() => {
    return selectedTest.value === 1 ? props.englishDomains : props.mathDomains
})

const nextStep = () => {
    if (step.value < 5) {
        step.value++
    }
}

const prevStep = () => {
    if (step.value > 1) {
        step.value--
    }
}

const selectAssessment = (id: number) => {
    selectedAssessment.value = id
}

const selectTest = (id: number) => {
    selectedTest.value = id
    selectedDomains.value = []
    selectAllDomains.value = false
}

const toggleTimer = () => {
    useTimer.value = !useTimer.value
    if (!useTimer.value) {
        timerType.value = 'stopwatch'
    }
}

const setTimerType = (type: 'stopwatch' | 'countdown') => {
    timerType.value = type
}

const toggleAllDomains = () => {
    selectAllDomains.value = !selectAllDomains.value
    if (selectAllDomains.value) {
        selectedDomains.value = availableDomains.value.map(domain => domain.id)
    } else {
        selectedDomains.value = []
    }
}

const toggleDomain = (domainId: string) => {
    const index = selectedDomains.value.indexOf(domainId)
    if (index === -1) {
        selectedDomains.value.push(domainId)
    } else {
        selectedDomains.value.splice(index, 1)
    }
    selectAllDomains.value = selectedDomains.value.length === availableDomains.value.length
}

const toggleResetProgress = () => {
    resetProgress.value = !resetProgress.value
}

const getAssessmentName = () => {
    return props.assessmentTypes.find(a => a.id === selectedAssessment.value)?.name || ''
}

const getTestName = () => {
    return props.testTypes.find(t => t.id === selectedTest.value)?.name || ''
}

const getTimerDescription = () => {
    if (!useTimer.value) return 'Disabled'
    if (timerType.value === 'stopwatch') return 'Stopwatch'
    const minutes = Math.floor(timerDuration.value / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m countdown`
}

const startPractice = () => {
    emit('start-practice', {
        selectedAssessment: selectedAssessment.value!,
        selectedTest: selectedTest.value!,
        selectedDomains: selectedDomains.value,
        useTimer: useTimer.value,
        timerType: timerType.value,
        timerDuration: timerDuration.value,
        resetProgress: resetProgress.value
    })
}
</script>