<template>
    <div>
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Practice Settings</h2>

        <!-- Timer Settings -->
        <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Timer Settings (Optional)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div @click="toggleTimer"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': useTimer, 'border-gray-200': !useTimer }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer-outline" class="text-2xl mr-2" />
                        <h4 class="font-semibold text-gray-800">Use Timer</h4>
                    </div>
                </div>
            </div>
            <div v-if="useTimer" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div @click="setTimerType('stopwatch')"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': timerType === 'stopwatch', 'border-gray-200': timerType !== 'stopwatch' }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer-outline" class="text-2xl mr-2" />
                        <h4 class="font-semibold text-gray-800">Stopwatch</h4>
                    </div>
                </div>
                <div @click="setTimerType('countdown')"
                    class="border rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-md"
                    :class="{ 'bg-blue-50 border-blue-500': timerType === 'countdown', 'border-gray-200': timerType !== 'countdown' }">
                    <div class="flex items-center">
                        <Icon icon="mdi:timer-sand" class="text-2xl mr-2" />
                        <h4 class="font-semibold text-gray-800">Countdown</h4>
                    </div>
                </div>
            </div>
            <div v-if="useTimer && timerType === 'countdown'" class="mt-4">
                <select v-model="timerDuration"
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option v-if="isSATSeries" :value="134 * 60">PSAT Standard Time (2h 14min)</option>
                    <option v-if="isSATSeries" :value="201 * 60">PSAT 50% Extended Time (3h 21min)</option>
                    <option v-if="isSATSeries" :value="268 * 60">PSAT 100% Extended Time (4h 28min)</option>
                    <option v-if="!isSATSeries" :value="40 * 60">AMC 8 Standard Time (40 min)</option>
                    <option v-if="!isSATSeries" :value="75 * 60">AMC 10/12 Standard Time (75 min)</option>
                    <option :value="30 * 60">30 minutes</option>
                    <option :value="60 * 60">60 minutes</option>
                    <option :value="90 * 60">90 minutes</option>
                    <option :value="120 * 60">120 minutes</option>
                </select>
            </div>
        </div>

        <!-- Reset Progress Option -->
        <div class="mt-6">
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
        </div>

        <div class="mt-6 flex justify-end">
            <button @click="startPractice"
                class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300">Start
                Practice</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

export default defineComponent({
    name: 'PracticeSettings',
    components: {
        Icon
    },
    props: {
        practiceType: {
            type: String as () => 'sat' | 'amc',
            required: true
        },
        selectedTest: {
            type: String,
            required: true
        }
    },
    emits: ['start-practice'],
    setup(props, { emit }) {
        const useTimer = ref(false)
        const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
        const timerDuration = ref(134 * 60) // 2h 14min
        const resetProgress = ref(false)

        const isSATSeries = computed(() => props.practiceType === 'sat')

        const toggleTimer = () => {
            useTimer.value = !useTimer.value
            if (!useTimer.value) {
                timerType.value = 'stopwatch'
            }
        }

        const setTimerType = (type: 'stopwatch' | 'countdown') => {
            timerType.value = type
        }

        const toggleResetProgress = () => {
            resetProgress.value = !resetProgress.value
        }

        const startPractice = () => {
            emit('start-practice', {
                selectedTest: props.selectedTest,
                useTimer: useTimer.value,
                timerType: timerType.value,
                timerDuration: timerDuration.value,
                resetProgress: resetProgress.value
            })
        }

        return {
            useTimer,
            timerType,
            timerDuration,
            resetProgress,
            isSATSeries,
            toggleTimer,
            setTimerType,
            toggleResetProgress,
            startPractice
        }
    }
})
</script>