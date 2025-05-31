// Enhanced utility functions for SAT practice platform

export interface ParsedExplanation {
    letter: string
    content: string
    isCorrect: boolean
    isSelected: boolean
}

export interface WrongQuestion {
    id: string
    externalId: string
    question: any
    userAnswer: string
    correctAnswer: string
    timestamp: number
    attempts: number
}

export interface PracticeProgress {
    questionId: string
    answered: boolean
    isCorrect: boolean
    userAnswer: string
    timestamp: number
}

export interface SessionStats {
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracy: number
}

// Enhanced explanation parser that handles the College Board format
export function parseCollegeBoardExplanation(
    rationale: string,
    correctAnswer: string,
    selectedAnswer: string,
    answerOptions: any[]
): ParsedExplanation[] {
    if (!rationale || !answerOptions) return []

    // Parse HTML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(rationale, 'text/html')

    // Initialize explanations for all choices
    const explanations: Record<string, string> = {
        'A': '',
        'B': '',
        'C': '',
        'D': ''
    }

    // Get all paragraphs from the rationale
    const paragraphs = Array.from(doc.querySelectorAll('p'))
    const fullText = paragraphs.map(p => p.innerHTML).join(' ')

    // Strategy 1: Parse individual choice explanations precisely
    const parseIndividualChoices = (): boolean => {
        let foundExplanations = false;

        // For each choice, find its specific explanation
        ['A', 'B', 'C', 'D'].forEach(letter => {
            // Pattern to match "Choice X is [status]. [explanation]"
            const choicePattern = new RegExp(
                `Choice ${letter} is (correct|incorrect|the best answer)\\s*\\.?\\s*([^]*?)(?=Choice [A-D] is|$)`,
                'i'
            )

            const match = fullText.match(choicePattern)
            if (match) {
                const [, _status, explanation] = match

                // Determine if this choice is actually correct based on the correctAnswer parameter
                const isActuallyCorrect = letter === correctAnswer

                // Clean up the explanation text
                const cleanExplanation = explanation.trim()

                if (isActuallyCorrect) {
                    explanations[letter] = `<p>Choice ${letter} is correct. ${cleanExplanation}</p>`
                } else {
                    // For incorrect choices, we need to rewrite the explanation to reflect that it's wrong
                    // Look for patterns that indicate why it's wrong (like "not 28", "not the correct value", etc.)
                    if (cleanExplanation.includes('not ') || cleanExplanation.includes('incorrect')) {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation}</p>`
                    } else {
                        // If the original explanation doesn't clearly state it's wrong, we modify it
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation} This does not match the required condition.</p>`
                    }
                }
                foundExplanations = true
            }
        })

        return foundExplanations
    }

    // Strategy 2: Parse by splitting text and correcting status
    const parseBySplittingAndCorrect = (): boolean => {
        let foundExplanations = false

        // Split the text by "Choice X" patterns
        const choiceSections = fullText.split(/(?=Choice [A-D] is)/i)

        choiceSections.forEach(section => {
            const choiceMatch = section.match(/Choice ([A-D]) is (correct|incorrect|the best answer)\.?\s*(.+?)$/is)
            if (choiceMatch) {
                const [, letter, _originalStatus, explanation] = choiceMatch

                // Determine actual correctness based on the correctAnswer parameter
                const isActuallyCorrect = letter === correctAnswer

                // Clean up the explanation to remove any trailing choice mentions
                const cleanExplanation = explanation.replace(/Choice [A-D] is.*/gi, '').trim()

                if (isActuallyCorrect) {
                    explanations[letter] = `<p>Choice ${letter} is correct. ${cleanExplanation}</p>`
                } else {
                    // For incorrect choices, modify the explanation appropriately
                    if (cleanExplanation.includes('not ') || cleanExplanation.includes('does not')) {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation}</p>`
                    } else {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${cleanExplanation} This is not the correct answer.</p>`
                    }
                }
                foundExplanations = true
            }
        })

        return foundExplanations
    }

    // Strategy 3: Parse paragraph-by-paragraph with correction
    const parseParagraphWithCorrection = (): boolean => {
        let foundExplanations = false

        paragraphs.forEach(paragraph => {
            const text = paragraph.innerHTML

            // Look for choice mentions in this specific paragraph
            const choiceMatch = text.match(/Choice ([A-D]) is (correct|incorrect|the best answer)/i)
            if (choiceMatch) {
                const [, letter, _originalStatus] = choiceMatch

                // Determine actual correctness
                const isActuallyCorrect = letter === correctAnswer

                // Extract the explanation content
                const explanationContent = text.replace(/Choice [A-D] is (correct|incorrect|the best answer)\.?\s*/gi, '').trim()

                if (isActuallyCorrect) {
                    explanations[letter] = `<p>Choice ${letter} is correct. ${explanationContent}</p>`
                } else {
                    // Check if the explanation already indicates it's wrong
                    if (explanationContent.includes('not ') || explanationContent.includes('does not') || explanationContent.includes('incorrect')) {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${explanationContent}</p>`
                    } else {
                        explanations[letter] = `<p>Choice ${letter} is incorrect. ${explanationContent} This does not satisfy the given conditions.</p>`
                    }
                }
                foundExplanations = true
            }
        })

        return foundExplanations
    }

    // Strategy 4: Fallback with proper status assignment
    const parseFallbackWithCorrection = (): void => {
        // For the correct answer
        const correctPattern = new RegExp(`Choice ${correctAnswer} is [^]*?(?=Choice [A-D]|$)`, 'i')
        const correctMatch = fullText.match(correctPattern)

        if (correctMatch) {
            explanations[correctAnswer] = `<p>${correctMatch[0].trim()}</p>`
        } else {
            explanations[correctAnswer] = `<p>Choice ${correctAnswer} is the correct answer.</p>`
        }

        // For other choices
        ['A', 'B', 'C', 'D'].forEach(letter => {
            if (letter !== correctAnswer && !explanations[letter]) {
                const choicePattern = new RegExp(`Choice ${letter} is [^]*?(?=Choice [A-D]|$)`, 'i')
                const choiceMatch = fullText.match(choicePattern)

                if (choiceMatch) {
                    let content = choiceMatch[0].trim()
                    // Replace "is correct" with "is incorrect" for wrong answers
                    content = content.replace(/is correct/gi, 'is incorrect')
                    explanations[letter] = `<p>${content}</p>`
                } else {
                    explanations[letter] = `<p>Choice ${letter} is incorrect.</p>`
                }
            }
        })
    }

    // Try parsing strategies in order
    let parsed = false

    if (parseIndividualChoices()) {
        parsed = true
    } else if (parseBySplittingAndCorrect()) {
        parsed = true
    } else if (parseParagraphWithCorrection()) {
        parsed = true
    }

    // If no specific explanations found, use fallback
    if (!parsed) {
        parseFallbackWithCorrection()
    }

    // Final pass: ensure all incorrect choices are properly labeled
    ['A', 'B', 'C', 'D'].forEach(letter => {
        if (letter !== correctAnswer && explanations[letter]) {
            // Make sure incorrect choices don't say "is correct"
            explanations[letter] = explanations[letter].replace(/is correct/gi, 'is incorrect')

            // If it still doesn't explicitly say "incorrect", add clarification
            if (!explanations[letter].toLowerCase().includes('incorrect') && !explanations[letter].toLowerCase().includes('not ')) {
                explanations[letter] = explanations[letter].replace(
                    `Choice ${letter}`,
                    `Choice ${letter} is incorrect.`
                )
            }
        }

        // Ensure we have some explanation for each choice
        if (!explanations[letter]) {
            if (letter === correctAnswer) {
                explanations[letter] = `<p>Choice ${letter} is the correct answer.</p>`
            } else {
                explanations[letter] = `<p>Choice ${letter} is incorrect.</p>`
            }
        }
    })

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

// Fixed answer checking logic
export function checkAnswer(question: any, selectedAnswer: string): boolean {
    if (!question || !selectedAnswer) return false

    if (question.type === 'mcq') {
        // For MCQ, get the correct option ID by letter
        const correctLetter = question.correct_answer[0]
        const correctIndex = correctLetter.charCodeAt(0) - 65
        const correctOptionId = question.answerOptions?.[correctIndex]?.id
        return selectedAnswer === correctOptionId
    } else if (question.type === 'spr') {
        // For SPR, check against all possible correct answers
        const userAnswer = selectedAnswer.trim().toLowerCase()
        return question.correct_answer.some((answer: string) => {
            const correctAnswer = answer.trim().toLowerCase()
            // Check exact match or numeric equivalence
            return userAnswer === correctAnswer ||
                (parseFloat(userAnswer) === parseFloat(correctAnswer) && !isNaN(parseFloat(userAnswer)))
        })
    }

    return false
}

// Wrong questions management with reactive updates
let wrongQuestionsUpdateCallbacks: (() => void)[] = []

export function onWrongQuestionsUpdate(callback: () => void) {
    wrongQuestionsUpdateCallbacks.push(callback)
}

export function offWrongQuestionsUpdate(callback: () => void) {
    wrongQuestionsUpdateCallbacks = wrongQuestionsUpdateCallbacks.filter(cb => cb !== callback)
}

function notifyWrongQuestionsUpdate() {
    wrongQuestionsUpdateCallbacks.forEach(callback => callback())
}

export function saveWrongQuestion(question: any, userAnswer: string): void {
    try {
        const wrongQuestions = getWrongQuestions()
        const existingIndex = wrongQuestions.findIndex(q => q.externalId === question.external_id)

        const wrongQuestion: WrongQuestion = {
            id: `wrong_${question.external_id}_${Date.now()}`,
            externalId: question.external_id,
            question: question,
            userAnswer: userAnswer,
            correctAnswer: question.correct_answer[0],
            timestamp: Date.now(),
            attempts: existingIndex >= 0 ? wrongQuestions[existingIndex].attempts + 1 : 1
        }

        if (existingIndex >= 0) {
            wrongQuestions[existingIndex] = wrongQuestion
        } else {
            wrongQuestions.push(wrongQuestion)
        }

        localStorage.setItem('sat_wrong_questions', JSON.stringify(wrongQuestions))
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.warn('Failed to save wrong question:', error)
    }
}

export function getWrongQuestions(): WrongQuestion[] {
    try {
        const saved = localStorage.getItem('sat_wrong_questions')
        return saved ? JSON.parse(saved) : []
    } catch (error) {
        console.warn('Failed to load wrong questions:', error)
        return []
    }
}

export function removeWrongQuestion(externalId: string): void {
    try {
        const wrongQuestions = getWrongQuestions()
        const filtered = wrongQuestions.filter(q => q.externalId !== externalId)
        localStorage.setItem('sat_wrong_questions', JSON.stringify(filtered))
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.warn('Failed to remove wrong question:', error)
    }
}

export function clearWrongQuestions(): void {
    try {
        localStorage.removeItem('sat_wrong_questions')
        notifyWrongQuestionsUpdate()
    } catch (error) {
        console.warn('Failed to clear wrong questions:', error)
    }
}

// Progress management
export function saveQuestionProgress(questionId: string, progress: PracticeProgress): void {
    try {
        const allProgress = getQuestionProgress()
        allProgress[questionId] = progress
        localStorage.setItem('sat_question_progress', JSON.stringify(allProgress))
    } catch (error) {
        console.warn('Failed to save question progress:', error)
    }
}

export function getQuestionProgress(): Record<string, PracticeProgress> {
    try {
        const saved = localStorage.getItem('sat_question_progress')
        return saved ? JSON.parse(saved) : {}
    } catch (error) {
        console.warn('Failed to load question progress:', error)
        return {}
    }
}

export function getSessionStats(questions: any[]): SessionStats {
    const progress = getQuestionProgress()
    const answeredQuestions = questions.filter(q => progress[q.external_id]?.answered).length
    const correctAnswers = questions.filter(q => progress[q.external_id]?.isCorrect).length
    const incorrectAnswers = answeredQuestions - correctAnswers

    return {
        totalQuestions: questions.length,
        answeredQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0
    }
}

// Import/Export functionality
export function exportWrongQuestions(): string {
    const wrongQuestions = getWrongQuestions()
    const progress = getQuestionProgress()

    const exportData = {
        wrongQuestions,
        progress,
        exportDate: new Date().toISOString(),
        version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
}

export function importWrongQuestions(jsonData: string): boolean {
    try {
        const data = JSON.parse(jsonData)

        if (data.wrongQuestions && Array.isArray(data.wrongQuestions)) {
            localStorage.setItem('sat_wrong_questions', JSON.stringify(data.wrongQuestions))
            notifyWrongQuestionsUpdate()
        }

        if (data.progress && typeof data.progress === 'object') {
            localStorage.setItem('sat_question_progress', JSON.stringify(data.progress))
        }

        return true
    } catch (error) {
        console.error('Failed to import data:', error)
        return false
    }
}

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

export function resetTimer(): void {
    localStorage.removeItem('sat_timer_state')
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