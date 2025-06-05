<template>
    <div class="p-2 sm:p-4 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Practice Settings</h2>

        <form @submit.prevent="startPractice" class="space-y-8">
            <!-- Assessment Type -->
            <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <label class="flex text-sm font-medium text-blue-700 mb-3 items-center">
                    <Icon icon="lucide:graduation-cap" class="mr-2 h-5 w-5" />
                    Assessment Type
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label v-for="type in assessmentTypes" :key="type.id"
                        class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none" :class="selectedAssessment === type.id
                            ? 'border-blue-600 bg-white shadow-sm'
                            : 'border-gray-300 bg-white hover:bg-gray-50'"
                        @click.stop="handleAssessmentClick(type)">
                        <input v-model="selectedAssessment" :value="type.id" type="radio" class="sr-only" />
                        <div class="flex flex-1">
                            <div class="flex flex-col">
                                <span class="block text-sm font-medium text-gray-900">
                                    {{ type.name }}
                                </span>
                                <span class="mt-1 text-xs text-gray-500">
                                    {{ getAssessmentDescription(type.id) }}
                                </span>
                            </div>
                        </div>
                        <Icon v-if="selectedAssessment === type.id" icon="lucide:check-circle"
                            class="h-5 w-5 text-blue-600" />
                    </label>
                </div>
            </div>

            <!-- Test Type -->
            <div class="bg-green-50 p-5 rounded-xl border border-green-100">
                <label class="flex text-sm font-medium text-green-700 mb-3 items-center">
                    <Icon icon="lucide:book-open" class="mr-2 h-5 w-5" />
                    Test Section
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label v-for="type in testTypes" :key="type.id"
                        class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                        :class="{
                            'border-green-600 bg-white shadow-sm': selectedTest === type.id,
                            'border-gray-300 bg-white hover:bg-gray-50': selectedAssessment !== null,
                            'border-gray-300 bg-gray-100 cursor-not-allowed': selectedAssessment === null
                        }"
                        @click.stop="selectedAssessment !== null && handleTestSectionClick(type)">
                        <input v-model="selectedTest" :value="type.id" type="radio" class="sr-only"
                            @change="onTestChange" :disabled="selectedAssessment === null" />
                        <div class="flex flex-1">
                            <div class="flex flex-col">
                                <span class="block text-sm font-medium text-gray-900">
                                    {{ type.name }}
                                </span>
                                <span class="mt-1 text-xs text-gray-500">
                                    {{ getTestDescription(type.id) }}
                                </span>
                            </div>
                        </div>
                        <Icon v-if="selectedTest === type.id" icon="lucide:check-circle"
                            class="h-5 w-5 text-green-600" />
                    </label>
                </div>
            </div>

            <!-- Domains -->
            <div v-if="selectedTest" class="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <div class="flex justify-between items-center mb-3">
                    <label class="flex text-sm font-medium text-purple-700 items-center">
                        <Icon icon="lucide:target" class="mr-2 h-5 w-5" />
                        Practice Domains
                    </label>
                    <button type="button" @click.stop="toggleAllDomains"
                        class="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        {{ selectAllDomains ? 'Deselect All' : 'Select All' }}
                    </button>
                </div>
                <p class="text-xs text-gray-500 mb-3">Select one or more domains to practice (multiple selection
                    allowed)</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div v-for="domain in availableDomains" :key="domain.id"
                        class="relative flex cursor-pointer rounded-lg border p-3 focus:outline-none" :class="selectedDomains.includes(domain.id)
                            ? 'border-purple-600 bg-white shadow-sm'
                            : 'border-gray-300 bg-white hover:bg-gray-50'"
                        @click.stop="handleDomainClick(domain)">
                        <div class="flex flex-1 items-center">
                            <Icon :icon="getDomainIcon(domain.id)" class="h-6 w-6 mr-3"
                                :class="selectedDomains.includes(domain.id) ? 'text-purple-600' : 'text-gray-400'" />
                            <div class="flex-1">
                                <span class="block text-sm font-medium text-gray-900">
                                    {{ domain.name }}
                                </span>
                            </div>
                            <button type="button" @click.stop="showExample(domain.id)"
                                class="ml-2 p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors duration-200"
                                title="View example question">
                                <Icon icon="lucide:file-search" class="h-4 w-4" />
                            </button>
                            <Icon v-if="selectedDomains.includes(domain.id)" icon="lucide:check-circle"
                                class="ml-2 h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div class="mt-2 text-xs text-gray-500 flex items-center">
                    <Icon icon="lucide:info" class="h-4 w-4 mr-1 text-purple-500" />
                    Selected: {{ selectedDomains.length }} of {{ availableDomains.length }} domains
                </div>
            </div>

            <!-- Timer Settings -->
            <div class="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <div class="flex items-center justify-between mb-3">
                    <label class="flex text-sm font-medium text-amber-700 items-center">
                        <Icon icon="lucide:timer" class="mr-2 h-5 w-5" />
                        Timer Settings
                    </label>
                    <button type="button" @click.stop="handleTimerToggle"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        :class="useTimer ? 'bg-amber-600' : 'bg-gray-200'">
                        <span
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            :class="useTimer ? 'translate-x-5' : 'translate-x-0'" />
                    </button>
                </div>

                <div v-if="!useTimer" class="text-sm text-gray-500 mb-2">
                    Timer is currently disabled. Toggle to enable timing for your practice session.
                </div>

                <div v-if="useTimer" class="space-y-4 bg-white p-4 rounded-lg border border-amber-200">
                    <div class="text-sm text-amber-800 mb-2 flex items-center">
                        <Icon icon="lucide:alert-circle" class="h-4 w-4 mr-1" />
                        Select timer mode:
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label class="relative flex cursor-pointer rounded-lg border p-3 focus:outline-none" :class="timerType === 'stopwatch'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-300 bg-white hover:bg-gray-50'" @click="timerType = 'stopwatch'"
                            data-umami-event="timer-mode-click" data-umami-event-detail="mode: stopwatch">
                            <div class="flex items-center">
                                <Icon icon="lucide:play" class="h-5 w-5 mr-3 text-amber-600" />
                                <div class="flex flex-col">
                                    <span class="block text-sm font-medium text-gray-900">
                                        Stopwatch
                                    </span>
                                    <span class="mt-1 flex items-center text-xs text-gray-500">
                                        Count up from zero
                                    </span>
                                </div>
                            </div>
                            <Icon v-if="timerType === 'stopwatch'" icon="lucide:check-circle"
                                class="ml-auto h-4 w-4 text-amber-600" />
                        </label>

                        <label class="relative flex cursor-pointer rounded-lg border p-3 focus:outline-none" :class="timerType === 'countdown'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-300 bg-white hover:bg-gray-50'" @click="timerType = 'countdown'"
                            data-umami-event="timer-mode-click" data-umami-event-detail="mode: countdown">
                            <div class="flex items-center">
                                <Icon icon="lucide:clock" class="h-5 w-5 mr-3 text-amber-600" />
                                <div class="flex flex-col">
                                    <span class="block text-sm font-medium text-gray-900">
                                        Countdown
                                    </span>
                                    <span class="mt-1 flex items-center text-xs text-gray-500">
                                        Set time limit
                                    </span>
                                </div>
                            </div>
                            <Icon v-if="timerType === 'countdown'" icon="lucide:check-circle"
                                class="ml-auto h-4 w-4 text-amber-600" />
                        </label>
                    </div>

                    <div v-if="timerType === 'countdown'" class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                        </label>
                        <select v-model="timerDuration"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            data-umami-event="timer-duration-select">
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

            <!-- Reset Progress -->
            <div class="bg-red-50 p-5 rounded-xl border border-red-100">
                <label
                    class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                    :class="resetProgress ? 'border-red-600 bg-white shadow-sm' : 'border-gray-300 bg-white hover:bg-gray-50'"
                    @click="resetProgress = !resetProgress"
                    data-umami-event="reset-progress-click"
                >
                    <div class="flex items-start">
                        <Icon icon="lucide:refresh-cw" class="h-5 w-5 mr-3 mt-0.5 text-red-600" />
                        <div class="flex flex-col">
                            <span class="block text-sm font-medium text-gray-900">
                                Reset Progress
                            </span>
                            <span class="mt-1 flex items-center text-sm text-gray-500">
                                Include previously completed questions in this session
                            </span>
                        </div>
                    </div>
                    <Icon v-if="resetProgress" icon="lucide:check-circle" class="ml-auto h-5 w-5 text-red-600" />
                </label>
            </div>

            <!-- Start Button -->
            <button type="submit" :disabled="!canStart"
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                data-umami-event="start-practice-click"
            >
                <div class="flex items-center justify-center">
                    <Icon icon="lucide:play" class="mr-2 h-5 w-5" />
                    Start Practice
                </div>
            </button>

            <div v-if="!canStart" class="text-center text-sm text-red-500 flex items-center justify-center">
                <Icon icon="lucide:alert-triangle" class="mr-1 h-4 w-4" />
                Please select assessment type, test section, and at least one domain
            </div>
        </form>
    </div>

    <!-- Example Question Modal -->
    <div v-if="showExampleModal" class="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                    <Icon icon="lucide:book-open" class="mr-2 h-5 w-5 text-purple-600" />
                    Example Question: {{ selectedExample?.type }}
                </h3>
                <button @click="showExampleModal = false"
                    class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                    <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
            </div>
            <div class="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                <div v-if="selectedExample" class="space-y-6">
                    <!-- Stimulus (if exists) -->
                    <div v-if="selectedExample.stimulus" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 class="font-medium text-blue-800 mb-2 flex items-center">
                            <Icon icon="lucide:file-text" class="mr-2 h-4 w-4" />
                            Passage/Context
                        </h4>
                        <div class="text-gray-700 leading-relaxed overflow-x-auto mx-auto"
                            v-html="selectedExample.stimulus"></div>
                    </div>

                    <!-- Question Stem -->
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                            <Icon icon="lucide:help-circle" class="mr-2 h-4 w-4" />
                            Question
                        </h4>
                        <!-- <p class="text-gray-700 font-medium">{{ selectedExample.stem }}</p> -->
                        <div class="text-gray-700 font-medium leading-relaxed" v-html="selectedExample.stem"></div>
                    </div>

                    <!-- Answer Options -->
                    <div v-if="selectedExample.answerOptions.length > 0" class="space-y-3">
                        <h4 class="font-medium text-gray-800 flex items-center">
                            <Icon icon="lucide:list" class="mr-2 h-4 w-4" />
                            Answer Choices
                        </h4>
                        <div class="space-y-2">
                            <div v-for="(option, index) in selectedExample.answerOptions" :key="index"
                                class="p-3 rounded-lg border transition-colors duration-200" :class="String.fromCharCode(65 + index) === selectedExample.correctAnswer
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'">
                                <div class="flex items-start">
                                    <span class="font-medium text-gray-600 mr-3 flex-shrink-0">
                                        {{ String.fromCharCode(65 + index) }}.
                                    </span>
                                    <span class="text-gray-700">{{ option }}</span>
                                    <Icon v-if="String.fromCharCode(65 + index) === selectedExample.correctAnswer"
                                        icon="lucide:check-circle"
                                        class="ml-auto h-5 w-5 text-green-600 flex-shrink-0" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Correct Answer for non-multiple choice -->
                    <div v-else class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 class="font-medium text-green-800 mb-2 flex items-center">
                            <Icon icon="lucide:check-circle" class="mr-2 h-4 w-4" />
                            Correct Answer
                        </h4>
                        <p class="text-green-700 font-medium">{{ selectedExample.correctAnswer }}</p>
                    </div>

                    <!-- Note -->
                    <div class="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <p class="text-amber-800 text-sm flex items-start">
                            <Icon icon="lucide:lightbulb" class="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                            This is an example question to help you understand what this domain covers.
                            The actual practice questions may vary in difficulty and format.
                        </p>
                    </div>
                </div>
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

interface ExampleQuestion {
    type: string
    stem: string
    stimulus: string
    answerOptions: string[]
    correctAnswer: string
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

const selectedAssessment = ref<number | null>(null)
const selectedTest = ref<number | null>(null)
const selectedDomains = ref<string[]>([])
const selectAllDomains = ref(false)
const useTimer = ref(false)
const timerType = ref<'stopwatch' | 'countdown'>('stopwatch')
const timerDuration = ref(134 * 60)
const resetProgress = ref(false)

// 添加模态框状态
const showExampleModal = ref<boolean>(false)
const selectedExample = ref<ExampleQuestion | null>(null)

// 添加例题数据
const exampleQuestions: Record<string, ExampleQuestion> = {
    'INI': {
        type: 'Information and Ideas',
        stem: 'Which finding from the study, if true, would most directly support the researchers\' conclusion?',
        stimulus: 'Almost all works of fiction contain references to the progression of time, including the time of day when events in a story take place. In a 2020 study, Allen Kim, Charuta Pethe, and Steven Skiena claim that an observable pattern in such references reflects a shift in human behavior prompted by the spread of electric lighting in the late nineteenth century...',
        answerOptions: [
            'Novels published after the year 1800 include the clock phrase 10 a.m. less often than novels published before the year 1800 do.',
            'Novels published after 1880 contain significantly more references to activities occurring after 10 p.m. than do novels from earlier periods.',
            'Among novels published in the nineteenth century, implied time references become steadily more common than clock phrases as publication dates approach 1900.',
            'The time references of noon (12 p.m.) and midnight (12 a.m.) are used with roughly the same frequency in the novels.'
        ],
        correctAnswer: 'B'
    },
    'CAS': {
        type: 'Craft and Structure',
        stem: 'Which choice completes the text with the most logical and precise word or phrase?',
        stimulus: 'Artist Marilyn Dingle\'s intricate, coiled baskets are ______ sweetgrass and palmetto palm. Following a Gullah technique that originated in West Africa, Dingle skillfully winds a thin palm frond around a bunch of sweetgrass with the help of a "sewing bone" to create the basket\'s signature look that no factory can reproduce.',
        answerOptions: [
            'indicated by',
            'handmade from',
            'represented by',
            'collected with'
        ],
        correctAnswer: 'B'
    },
    'EOI': {
        type: 'Expression of Ideas',
        stem: 'Which choice completes the text with the most logical transition?',
        stimulus: 'The prime meridian, the global indicator of zero degrees longitude established in 1884, was originally determined using astronomically derived coordinates. ______ as decades passed, new calculations would reveal increasingly precise coordinates, yet the prime meridian remained unchanged; it wasn\'t until the 1980s that, spurred by improved geodetic data, the prime meridian was officially moved—roughly one hundred meters east.',
        answerOptions: [
            'Specifically,',
            'To that end,',
            'Again and again,',
            'Granted,'
        ],
        correctAnswer: 'C'
    },
    'SEC': {
        type: 'Standard English Conventions',
        stem: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        stimulus: 'Generations of mystery and horror ______ have been influenced by the dark, gothic stories of celebrated American author Edgar Allan Poe (1809–1849).',
        answerOptions: [
            'writers',
            'writers,',
            'writers—',
            'writers;'
        ],
        correctAnswer: 'A'
    },
    'H': {
        type: 'Algebra',
        stem: '<p>Which choice completes the text so that it conforms to the conventions of Standard English?</p>',
        stimulus: '',
        answerOptions: [
            'The length of the rectangle, in feet',
            'The area of the rectangle, in square feet',
            'The difference between the length and the width of the rectangle, in feet',
            'The width of the rectangle, in feet'
        ],
        correctAnswer: 'A'
    },
    'P': {
        type: 'Advanced Math',
        stem: '<p style=\"text-align: left;\">A rectangle has a length that is <math alttext=\"15\"><mn>15</mn>\n</math> times its width. The function <math alttext=\"y equals left parenthesis 15 w right parenthesis left parenthesis w right parenthesis\"><mi>y</mi><mo>=</mo><mfenced><mrow><mrow><mn>15</mn></mrow><mi>w</mi></mrow></mfenced><mfenced><mi>w</mi></mfenced></math> represents this situation, where <math alttext=\"y\"><mi>y</mi>\n</math> is the area, in square feet, of the rectangle and <math alttext=\"y greater than 0\"><mi>y</mi><mo>&#62;</mo><mn>0</mn></math>. Which of the following is the best interpretation of <math alttext=\"15 w\"><mrow><mn>15</mn></mrow><mi>w</mi></math> in this context?</p>',
        stimulus: '',
        answerOptions: [
            'The length of the rectangle, in feet',
            'The area of the rectangle, in square feet',
            'The difference between the length and the width of the rectangle, in feet',
            'The width of the rectangle, in feet'
        ],
        correctAnswer: 'A'
    },
    'Q': {
        type: 'Problem-Solving and Data Analysis',
        stem: '<p style=\"text-align: left;\">There are <math alttext=\"55\"><mn>55</mn>\n</math> students in Spanish club. A sample of the Spanish club students was selected at random and asked whether they intend to enroll in a new study program. Of those surveyed, <math alttext=\"20 percent sign\"><mn>20</mn><mo>%</mo></math> responded that they intend to enroll in the study program. Based on this survey, which of the following is the best estimate of the total number of Spanish club students who intend to enroll in the study program?</p>',
        stimulus: '',
        answerOptions: [
            '11',
            '20',
            '44',
            '55'
        ],
        correctAnswer: 'A'
    },
    'S': {
        type: 'Geometry and Trigonometry',
        // stem: 'In the figure, AC = CD. The measure of angle EBC is 45°, and the measure of angle ACD is 104°. What is the value of x?',
        stem: '<p style="text-align: left;">In the figure, <math alttext="AC equals CD"><mrow><mrow><mi>A</mi><mi>C</mi></mrow><mo>=</mo><mrow><mi>C</mi><mi>D</mi></mrow></mrow></math>. The measure of angle <math alttext="EBC"><mi>E</mi><mi>B</mi><mi>C</mi></math> is <math alttext="45°"><mrow><mn>45</mn></mrow><mo>°</mo></math>, and the measure of angle <math alttext="ACD"><mi>A</mi><mi>C</mi><mi>D</mi></math> is <math alttext="104°"><mrow><mn>104</mn></mrow><mo>°</mo></math>. What is the value of <math alttext="x"><mi>x</mi></math>?</p>',
        stimulus: `<p style="text-align: left;"><figure class='image'><svg xmlns="http://www.w3.org/2000/svg" width="327.078" height="267.707" viewBox="0 0 327.078 267.707" role="img" aria-label="A diagram of 2 partially overlapping triangles. Refer to long description."><g id="b1d6dff2-bf15-405d-862c-106854be3ca3" data-name="Layer 1"><polygon points="163.274 108.033 312.484 202.963 14.064 202.963 163.274 108.033" fill="none" stroke="#231f20" stroke-linejoin="round" stroke-width="1.89"></polygon><polyline points="163.274 107.972 312.484 13.042 222.245 202.716" fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.89"></polyline><path d="M14.064,203.536" fill="none" stroke="#231f20" stroke-linejoin="round" stroke-width="1.89"></path><path d="M320.933,218.7v-.049c0-.006-.01-.018-.029-.038a.156.156,0,0,0-.078-.039c-.032-.006-.077-.013-.136-.019s-.135-.013-.232-.02-.213-.013-.349-.018-.3-.01-.484-.01h-.649q-.408,0-1.8.1a3.626,3.626,0,0,0-.523.776q-.465.774-.911,1.685a3.725,3.725,0,0,0-.445,1.2.441.441,0,0,0,.27.368,1.543,1.543,0,0,0,.5.193,2.16,2.16,0,0,0,.3.039c.026,0,.039.038.039.116a.9.9,0,0,1-.1.408q-1.8-.1-1.841-.1c-.245,0-.462.007-.649.019s-.391.027-.611.039-.432.026-.639.04a.229.229,0,0,1-.039-.156c0-.245.045-.368.136-.368a2.182,2.182,0,0,0,.591-.116,1.171,1.171,0,0,0,.533-.291,10.935,10.935,0,0,0,1.182-1.821l5.348-9.614a.862.862,0,0,1,.756-.522.358.358,0,0,1,.156.038l1.608,10.232q.194,1.222.232,1.4c.04.194.2.358.5.494a1.767,1.767,0,0,0,.629.2c.027,0,.04.032.04.1a.953.953,0,0,1-.1.427q-1.8-.1-2.016-.1c-.246,0-.474.007-.688.019s-.448.027-.707.039-.485.026-.678.04c-.014-.014-.02-.052-.02-.118,0-.27.045-.406.136-.406a1.869,1.869,0,0,0,.542-.116.823.823,0,0,0,.446-.272,2.287,2.287,0,0,0,.136-.911Q321.282,221.243,320.933,218.7Zm-1.7-1.143c.593,0,1.079-.013,1.453-.039a.069.069,0,0,0,.078-.078q0-.1-.126-.911t-.291-1.9q-.165-1.086-.223-1.492-2.384,4.32-2.384,4.36c0,.025.007.038.02.038Q318.2,217.561,319.228,217.56Z" fill="#231f20"></path><path d="M326.69,8.585a3.8,3.8,0,0,1-1.444,2.878,5.648,5.648,0,0,1-3.9,1.289H318.88l-2.132.058a.392.392,0,0,1-.019-.174c0-.259.044-.388.135-.388a2.851,2.851,0,0,0,.708-.136c.317-.09.5-.194.552-.31a7.731,7.731,0,0,0,.5-1.8l1.4-7.209a9.94,9.94,0,0,0,.213-1.8q0-.135-.435-.3a2.078,2.078,0,0,0-.65-.165c-.026,0-.039-.025-.039-.077A.61.61,0,0,1,319.248,0c.6.026,1.285.039,2.074.039q.91,0,1.492-.01c.388-.007.737-.009,1.046-.009a4.675,4.675,0,0,1,1.077.126,4.07,4.07,0,0,1,1.026.4,2.135,2.135,0,0,1,.8.786,2.265,2.265,0,0,1,.31,1.192,3.02,3.02,0,0,1-.136.9,2.75,2.75,0,0,1-.349.747,4.106,4.106,0,0,1-.485.581,4.474,4.474,0,0,1-.523.456,4.807,4.807,0,0,1-.475.31,3.8,3.8,0,0,1-.358.184l-.116.058a2.55,2.55,0,0,1,1.317.911A2.765,2.765,0,0,1,326.69,8.585Zm-1.744.078a2.294,2.294,0,0,0-.639-1.677,2.8,2.8,0,0,0-2.055-.649c-.917,0-1.4.1-1.434.291l-.737,3.876a6.045,6.045,0,0,0-.1.93.4.4,0,0,0,.272.436,3.212,3.212,0,0,0,.891.088,4.817,4.817,0,0,0,1.88-.252,3.374,3.374,0,0,0,1.357-1.183A3.194,3.194,0,0,0,324.946,8.663Zm.485-5.911a1.739,1.739,0,0,0-2-1.938c-.944,0-1.428.084-1.455.252l-.872,4.205a.109.109,0,0,0,.069.126.8.8,0,0,0,.261.078,3.451,3.451,0,0,0,.369.039c.129.006.277.009.445.009a6.3,6.3,0,0,0,1.066-.077,4.061,4.061,0,0,0,.989-.33,1.728,1.728,0,0,0,.833-.852A3.48,3.48,0,0,0,325.431,2.752Z" fill="#231f20"></path></g></svg><div role="region" aria-label="Long description for diagram of 2 overlapping triangles" class="sr-only"><ul><li>Triangle ACD partially overlaps triangle EBD.</li><li>Point C is on line segment BD.</li><li>Point E is on line segment AD.</li><li>The measure of angle AEB is x°.</li><li>A note indicates the figure is not drawn to scale.</li></ul></div></figure></p><p style="text-align: center;">&nbsp;</p>`,
        answerOptions: [],
        correctAnswer: '83'
    }
}

// 添加示例题点击事件统计
const showExample = (domainId: string): void => {
    // 查找对应的 domain 对象，获取可视化名称
    const domainObj = availableDomains.value.find(d => d.id === domainId) || { name: domainId };
    if(window.umami) {
        window.umami.track('ExampleQuestionClicked', { domain: domainObj.name });
    }
    selectedExample.value = exampleQuestions[domainId]
    showExampleModal.value = true
}

const availableDomains = computed(() => {
    return selectedTest.value === 1 ? props.englishDomains : props.mathDomains
})

const canStart = computed(() => {
    return selectedAssessment.value !== null &&
        selectedTest.value !== null &&
        selectedDomains.value.length > 0
})

const onTestChange = () => {
    selectedDomains.value = []
    selectAllDomains.value = false
}

const toggleAllDomains = () => {
    selectAllDomains.value = !selectAllDomains.value
    if (selectAllDomains.value) {
        selectedDomains.value = availableDomains.value.map(domain => domain.id)
        if (window.umami) {
            window.umami.track('DomainBulkSelection', { action: 'select all', testSection: getTestDescription(selectedTest.value!) })
        }
    } else {
        selectedDomains.value = []
        if (window.umami) {
            window.umami.track('DomainBulkSelection', { action: 'deselect all', testSection: getTestDescription(selectedTest.value!) })
        }
    }
}

const getAssessmentDescription = (id: number): string => {
    switch (id) {
        case 99:
            return 'Full SAT practice test'
        case 100:
            return 'PSAT/NMSQT qualification test'
        case 102:
            return 'PSAT for 8th/9th grade students'
        default:
            return 'Standard assessment'
    }
}

const getTestDescription = (id: number): string => {
    switch (id) {
        case 1:
            return 'Reading and writing section with explanations'
        case 2:
            return 'Math section with calculator and no-calculator portions'
        default:
            return 'Standard test section'
    }
}

const getDomainIcon = (id: string): string => {
    // English domains
    if (id === 'INI') return 'lucide:book-open' // Information and Ideas
    if (id === 'CAS') return 'lucide:text' // Craft and Structure
    if (id === 'EOI') return 'lucide:pen-tool' // Expression of Ideas
    if (id === 'SEC') return 'lucide:check-square' // Standard English Conventions

    // Math domains
    if (id === 'H') return 'lucide:function-square' // Algebra
    if (id === 'P') return 'lucide:infinity' // Problem Solving and Data Analysis
    if (id === 'Q') return 'lucide:bar-chart-2' // Problem-Solving and Data Analysis
    if (id === 'S') return 'lucide:triangle' // Geometry and Trigonometry

    return 'lucide:target' // Default icon
}

const startPractice = () => {
    if (canStart.value) {
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
}

// 处理 umami 统计发送可视化信息，且避免重复传输
const handleAssessmentClick = (type: { id: number; name: string }) => {
    // 更新选择状态（由v-model自动更新）后发送转译信息
    if (window.umami) {
        const info = getAssessmentDescription(type.id) // 返回具体描述，如 "Full SAT practice test"
        window.umami.track('AssessmentTypeSelected', { value: info });
    }
};

const handleTestSectionClick = (type: { id: number; name: string }) => {
    if (window.umami) {
        const info = getTestDescription(type.id); // 返回实际描述，如 "Reading and writing section with explanations"
        window.umami.track('TestSectionSelected', { value: info });
    }
};

interface Domain {
    id: string;
    name: string;
}

const handleDomainClick = (domain: Domain) => {
    const alreadySelected = selectedDomains.value.includes(domain.id);
    if (window.umami) {
        // 发送可视化信息用 domain.name 而非id
        window.umami.track('DomainSelection', { domain: domain.name, action: alreadySelected ? 'deselected' : 'selected' });
    }
    // 更新选中状态
    if (alreadySelected) {
        selectedDomains.value.splice(selectedDomains.value.indexOf(domain.id), 1);
    } else {
        selectedDomains.value.push(domain.id);
    }
};

// 处理 timer toggle 点击事件
const handleTimerToggle = () => {
    const newState = !useTimer.value;
    useTimer.value = newState;
    if (window.umami) {
        window.umami.track('TimerToggle', { state: newState ? 'on' : 'off' });
    }
};
</script>