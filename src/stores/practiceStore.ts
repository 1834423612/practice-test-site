import { ref } from 'vue'

export const wrongPracticeData = ref<any[]>([])

export const setWrongPracticeData = (data: any[]) => {
	wrongPracticeData.value = data
}

export const clearWrongPracticeData = () => {
	wrongPracticeData.value = []
}
