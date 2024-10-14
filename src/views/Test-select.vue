<template>
    <div class="max-w-md mx-auto">
        <h2 class="text-xl font-semibold mb-4">Select Practice Type</h2>
        <div class="space-y-4">
            <button v-for="test in tests" :key="test.id" @click="selectTest(test)"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                {{ test.name }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Home',
    data() {
        return {
            tests: [
                { id: 1, name: 'PSAT/NMSQT', asmtEventId: 100 },
                { id: 2, name: 'SAT', asmtEventId: 99 },
                { id: 3, name: 'PSAT 8/9', asmtEventId: 102 }
            ]
        }
    },
    methods: {
        selectTest(test) {
            localStorage.setItem('selectedAsmtEventId', test.asmtEventId.toString())
            this.$router.push({
                name: 'Practice',
                params: { testId: test.id, asmtEventId: test.asmtEventId }
            })
        }
    }
}
</script>