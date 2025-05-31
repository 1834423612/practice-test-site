// Enhanced utility functions for the SAT practice platform

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
}

export interface ParsedExplanation {
    letter: string
    content: string
    isCorrect: boolean
    isSelected: boolean
}

export function parseExplanation(
    explanation: string,
    correctAnswer: string,
    selectedAnswer: string,
    answerOptions: any[]
): ParsedExplanation[] {
    if (!explanation) return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(explanation, 'text/html')

    // Initialize explanations for all choices
    const explanations: Record<string, string> = {
        'A': '',
        'B': '',
        'C': '',
        'D': ''
    }

    // Strategy 1: Parse individual choice explanations
    const parseIndividualChoices = (): boolean => {
        const paragraphs = Array.from(doc.querySelectorAll('p'))
        let currentChoice: string | null = null
        let foundChoices = false

        paragraphs.forEach((p) => {
            const text = p.textContent || ''
            const choiceMatch = text.match(/^Choice ([A-D])/i)

            if (choiceMatch) {
                currentChoice = choiceMatch[1].toUpperCase()
                explanations[currentChoice] = p.outerHTML
                foundChoices = true
            } else if (currentChoice && text.trim()) {
                explanations[currentChoice] += '<br/>' + p.outerHTML
            }
        })

        return foundChoices
    }

    // Strategy 2: Parse explanations with choice patterns in text
    const parseChoicePatterns = (): boolean => {
        const fullText = explanation
        const choicePattern = /Choice ([A-D])[:\s]/gi
        const matches = [...fullText.matchAll(choicePattern)]

        if (matches.length > 0) {
            matches.forEach((match, index) => {
                const choice = match[1].toUpperCase()
                const startIndex = match.index! + match[0].length
                const endIndex = index < matches.length - 1 ? matches[index + 1].index! : fullText.length
                const content = fullText.substring(startIndex, endIndex).trim()

                if (content) {
                    explanations[choice] = `<p>${content}</p>`
                }
            })
            return true
        }
        return false
    }

    // Strategy 3: Parse explanations that mention "is correct" or "is incorrect"
    const parseCorrectIncorrectPatterns = (): boolean => {
        const sentences = explanation.split(/[.!?]+/)
        let foundPatterns = false

        sentences.forEach(sentence => {
            const choiceMatch = sentence.match(/([A-D])\s+is\s+(correct|incorrect|the best answer)/i)
            if (choiceMatch) {
                const choice = choiceMatch[1].toUpperCase()
                const cleanSentence = sentence.trim()
                if (cleanSentence) {
                    explanations[choice] = explanations[choice]
                        ? explanations[choice] + `<br/><p>${cleanSentence}.</p>`
                        : `<p>${cleanSentence}.</p>`
                    foundPatterns = true
                }
            }
        })

        return foundPatterns
    }

    // Strategy 4: General explanation for all choices
    const useGeneralExplanation = () => {
        const choices = ['A', 'B', 'C', 'D']
        choices.forEach(choice => {
            explanations[choice] = explanation
        })
    }

    // Try parsing strategies in order
    if (!parseIndividualChoices() && !parseChoicePatterns() && !parseCorrectIncorrectPatterns()) {
        useGeneralExplanation()
    }

    // Build result array
    const choices: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
    return choices.map((letter) => {
        const isCorrect = letter === correctAnswer
        const isSelected = getSelectedChoiceLetter(selectedAnswer, answerOptions) === letter

        return {
            letter,
            content: explanations[letter] || '<p>No explanation available for this choice.</p>',
            isCorrect,
            isSelected
        }
    })
}

function getSelectedChoiceLetter(selectedAnswer: string, answerOptions: any[]): string | null {
    if (!selectedAnswer || !answerOptions) return null

    const optionIndex = answerOptions.findIndex(opt => opt.id === selectedAnswer)
    if (optionIndex === -1) return null

    return String.fromCharCode(65 + optionIndex)
}

export function calculateAccuracy(correct: number, total: number): string {
    if (total === 0) return '0.0'
    return ((correct / total) * 100).toFixed(1)
}

export function getPerformanceLevel(accuracy: number): string {
    if (accuracy >= 90) return 'Excellent'
    if (accuracy >= 80) return 'Very Good'
    if (accuracy >= 70) return 'Good'
    if (accuracy >= 60) return 'Fair'
    return 'Needs Improvement'
}

export function getPerformanceColor(accuracy: number): string {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else {
        return `${minutes}m`
    }
}

export function generateStudyRecommendations(domainPerformance: Record<string, any>): string[] {
    const recommendations: string[] = []

    Object.values(domainPerformance).forEach((domain: any) => {
        const accuracy = (domain.correct / domain.total) * 100

        if (accuracy < 60) {
            recommendations.push(`Focus more practice on ${domain.name} - current accuracy: ${accuracy.toFixed(1)}%`)
        } else if (accuracy < 80) {
            recommendations.push(`Continue practicing ${domain.name} to reach mastery level`)
        }
    })

    if (recommendations.length === 0) {
        recommendations.push('Great job! Continue practicing to maintain your high performance level.')
    }

    return recommendations
}

export function saveProgressToStorage(data: any): void {
    try {
        localStorage.setItem('sat_practice_progress', JSON.stringify({
            ...data,
            timestamp: Date.now()
        }))
    } catch (error) {
        console.warn('Failed to save progress to localStorage:', error)
    }
}

export function loadProgressFromStorage(): any | null {
    try {
        const saved = localStorage.getItem('sat_practice_progress')
        if (saved) {
            const data = JSON.parse(saved)
            // Check if data is not too old (7 days)
            if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
                return data
            }
        }
    } catch (error) {
        console.warn('Failed to load progress from localStorage:', error)
    }
    return null
}