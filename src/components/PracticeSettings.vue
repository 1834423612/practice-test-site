<template>
    <div>
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Practice Settings</h2>

        <!-- Step 1: Select Assessment Type -->
        <div v-if="step === 1">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Select Assessment Type</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="test in assessmentTypes" :key="test.id" @click="selectAssessment(test.id)"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': selectedAssessment === test.id, 'border-gray-200': selectedAssessment !== test.id }">
                    <h4 class="font-semibold text-gray-800">{{ test.name }}</h4>
                </div>
            </div>
            <button @click="nextStep" :disabled="!selectedAssessment"
                class="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition duration-300">Next</button>
        </div>

        <!-- Step 2: Select Test Type -->
        <div v-if="step === 2">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Select Test Type</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="test in testTypes" :key="test.id" @click="selectTest(test.id)"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': selectedTest === test.id, 'border-gray-200': selectedTest !== test.id }">
                    <h4 class="font-semibold text-gray-800">{{ test.name }}</h4>
                </div>
            </div>
            <div class="mt-6 flex justify-between">
                <button @click="prevStep"
                    class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition duration-300">Back</button>
                <button @click="nextStep" :disabled="!selectedTest"
                    class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition duration-300">Next</button>
            </div>
        </div>

        <!-- Step 3: Select Domains -->
        <div v-if="step === 3">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Select Domains</h3>
            <div class="space-y-2">
                <div @click="toggleAllDomains"
                    class="cursor-pointer text-blue-600 hover:text-blue-800 transition duration-300">
                    {{ selectAllDomains ? 'Deselect All' : 'Select All' }}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="domain in availableDomains" :key="domain.id" @click="toggleDomain(domain.id)"
                        class="border rounded-lg p-3 cursor-pointer transition duration-300 hover:shadow-md"
                        :class="{ 'bg-blue-50 border-blue-500': selectedDomains.includes(domain.id), 'border-gray-200': !selectedDomains.includes(domain.id) }">
                        <span class="text-gray-700">{{ domain.name }}</span>
                    </div>
                </div>
            </div>
            <div class="mt-6 flex justify-between">
                <button @click="prevStep"
                    class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition duration-300">Back</button>
                <button @click="nextStep" :disabled="selectedDomains.length === 0"
                    class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition duration-300">Next</button>
            </div>
        </div>

        <!-- Step 4: Timer Settings -->
        <div v-if="step === 4">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Timer Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div @click="toggleTimer"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': useTimer, 'border-gray-200': !useTimer }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer" class="text-2xl mr-2"
                            :class="useTimer ? 'text-blue-500' : 'text-gray-400'" />
                        <h4 class="font-semibold text-gray-800">Use Timer</h4>
                    </div>
                </div>
            </div>
            <div v-if="useTimer" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div @click="setTimerType('stopwatch')"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': timerType === 'stopwatch', 'border-gray-200': timerType !== 'stopwatch' }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer-outline" class="text-2xl mr-2"
                            :class="timerType === 'stopwatch' ? 'text-blue-500' : 'text-gray-400'" />
                        <h4 class="font-semibold text-gray-800">Stopwatch</h4>
                    </div>
                </div>
                <div @click="setTimerType('countdown')"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': timerType === 'countdown', 'border-gray-200': timerType !== 'countdown' }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer-sand" class="text-2xl mr-2"
                            :class="timerType === 'countdown' ? 'text-blue-500' : 'text-gray-400'" />
                        <h4 class="font-semibold text-gray-800">Countdown</h4>
                    </div>
                </div>
            </div>
            <div v-if="useTimer && timerType === 'countdown'" class="mt-4">
                <select v-model="timerDuration"
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option :value="134 * 60">PSAT Standard Time (2h 14min)</option>
                    <option :value="201 * 60">PSAT 50% Extended Time (3h 21min)</option>
                    <option :value="268 * 60">PSAT 100% Extended Time (4h 28min)</option>
                    <option :value="30 * 60">30 minutes</option>
                    <option :value="60 * 60">60 minutes</option>
                    <option :value="90 * 60">90 minutes</option>
                    <option :value="120 * 60">120 minutes</option>
                </select>
            </div>
            <div class="mt-6 flex justify-between">
                <button @click="prevStep"
                    class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition duration-300">Back</button>
                <button @click="nextStep"
                    class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-300">Next</button>
            </div>
        </div>

        <!-- Step 5: Reset Progress Option -->
        <div v-if="step === 5">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Reset Progress (Optional)</h3>
            <div @click="toggleResetProgress"
                class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                :class="{ 'bg-blue-50 border-blue-500': resetProgress, 'border-gray-200': !resetProgress }">
                <div class="flex items-center">
                    <Icon icon="mdi:refresh" class="text-2xl mr-2"
                        :class="resetProgress ? 'text-blue-500' : 'text-gray-400'" />
                    <h4 class="font-semibold text-gray-800">Reset Progress (Include previously completed questions)</h4>
                </div>
            </div>
            <p class="mt-2 text-sm text-gray-600">This option is not mandatory. Select it only if you want to include
                questions you've completed before.</p>
            <div class="mt-6 flex justify-between">
                <button @click="prevStep"
                    class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition duration-300">Back</button>
                <button @click="startPractice"
                    class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300">Start
                    Practice</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface AssessmentType {
    id: number;
    name: string;
}

interface TestType {
    id: number;
    name: string;
}

interface Domain {
    id: string;
    name: string;
}

export default defineComponent({
    name: 'PracticeSettings',
    components: {
        Icon
    },
    props: {
        assessmentTypes: {
            type: Array as () => AssessmentType[],
            required: true
        },
        testTypes: {
            type: Array as () => TestType[],
            required: true
        },
        englishDomains: {
            type: Array as () => Domain[],
            required: true
        },
        mathDomains: {
            type: Array as () => Domain[],
            required: true
        },
    },
    emits: ['start-practice'],
    setup(props, { emit }) {
        const step = ref(1)
        const selectedAssessment = ref<number | null>(null)
        const selectedTest = ref<number | null>(null)
        const selectedDomains = ref<string[]>([])
        const selectAllDomains = ref(false)
        const useTimer = ref(false)
        const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
        const timerDuration = ref(134 * 60) // 2h 14min
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

        const startPractice = () => {
            emit('start-practice', {
                selectedAssessment: selectedAssessment.value,
                selectedTest: selectedTest.value,
                selectedDomains: selectedDomains.value,
                useTimer: useTimer.value,
                timerType: timerType.value,
                timerDuration: timerDuration.value,
                resetProgress: resetProgress.value
            })
        }

        return {
            step,
            selectedAssessment,
            selectedTest,
            selectedDomains,
            selectAllDomains,
            useTimer,
            timerType,
            timerDuration,
            resetProgress,
            availableDomains,
            nextStep,
            prevStep,
            selectAssessment,
            selectTest,
            toggleTimer,
            setTimerType,
            toggleAllDomains,
            toggleDomain,
            toggleResetProgress,
            startPractice

        }
    }
})
</script>