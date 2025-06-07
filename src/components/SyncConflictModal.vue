<template>
    <div class="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800">Sync Conflicts Detected</h3>
                        <p class="text-gray-600 mt-1">
                            Some wrong questions have conflicts between local and cloud data. Please choose how to
                            resolve them.
                        </p>
                    </div>
                    <button @click="$emit('close')"
                        class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                        <Icon icon="lucide:x" class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div class="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                <div class="space-y-6">
                    <div v-for="(conflict, index) in conflicts" :key="conflict.localQuestion.externalId"
                        class="border border-gray-200 rounded-lg p-4">
                        <div class="mb-4">
                            <h4 class="font-medium text-gray-800 mb-2">
                                Question {{ index + 1 }} - {{ getConflictDescription(conflict.conflictType) }}
                            </h4>
                            <div class="text-sm text-gray-600 mb-3">
                                Question ID: {{ conflict.localQuestion.externalId }}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Local Data -->
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 class="font-medium text-blue-800 mb-2 flex items-center">
                                    <Icon icon="lucide:smartphone" class="w-4 h-4 mr-1" />
                                    Local Data
                                </h5>
                                <div class="text-sm space-y-1">
                                    <div><strong>Answer:</strong> {{ conflict.localQuestion.userAnswer }}</div>
                                    <div><strong>Attempts:</strong> {{ conflict.localQuestion.attempts }}</div>
                                    <div><strong>Last Wrong:</strong> {{ formatDate(conflict.localQuestion.timestamp) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Cloud Data -->
                            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                                <h5 class="font-medium text-green-800 mb-2 flex items-center">
                                    <Icon icon="lucide:cloud" class="w-4 h-4 mr-1" />
                                    Cloud Data
                                </h5>
                                <div class="text-sm space-y-1">
                                    <div><strong>Answer:</strong> {{ conflict.cloudQuestion.user_answer }}</div>
                                    <div><strong>Attempts:</strong> {{ conflict.cloudQuestion.attempts }}</div>
                                    <div><strong>Last Wrong:</strong> {{ formatDate(new
                                        Date(conflict.cloudQuestion.last_wrong_at).getTime()) }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Resolution Options -->
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Choose Resolution:</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input v-model="resolutions[conflict.localQuestion.externalId]" type="radio"
                                        value="keep_local" class="mr-2" />
                                    <span class="text-sm">Keep local data (overwrite cloud)</span>
                                </label>
                                <label class="flex items-center">
                                    <input v-model="resolutions[conflict.localQuestion.externalId]" type="radio"
                                        value="keep_cloud" class="mr-2" />
                                    <span class="text-sm">Keep cloud data (overwrite local)</span>
                                </label>
                                <label class="flex items-center">
                                    <input v-model="resolutions[conflict.localQuestion.externalId]" type="radio"
                                        value="merge" class="mr-2" />
                                    <span class="text-sm">Merge data (combine attempts, keep latest timestamp)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button @click="$emit('close')"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                    Cancel
                </button>
                <button @click="handleResolve" :disabled="!allConflictsResolved"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                    Resolve Conflicts
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import type { SyncConflict, ConflictResolution } from '@/utils/wrongQuestionsSync'

const props = defineProps<{
    conflicts: SyncConflict[]
}>()

const emit = defineEmits<{
    close: []
    resolve: [resolutions: ConflictResolution[]]
}>()

const resolutions = reactive<Record<string, string>>({})

// Initialize resolutions
props.conflicts.forEach(conflict => {
    resolutions[conflict.localQuestion.externalId] = 'merge'
})

const allConflictsResolved = computed(() => {
    return props.conflicts.every(conflict =>
        resolutions[conflict.localQuestion.externalId]
    )
})

const getConflictDescription = (type: string): string => {
    switch (type) {
        case 'different_answer':
            return 'Different user answers'
        case 'different_attempts':
            return 'Different attempt counts'
        case 'different_timestamp':
            return 'Different timestamps'
        default:
            return 'Unknown conflict'
    }
}

const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const handleResolve = () => {
    const resolutionList: ConflictResolution[] = props.conflicts.map(conflict => ({
        questionId: conflict.localQuestion.externalId,
        resolution: resolutions[conflict.localQuestion.externalId] as 'keep_local' | 'keep_cloud' | 'merge'
    }))

    emit('resolve', resolutionList)
}
</script>
