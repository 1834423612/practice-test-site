export interface AssessmentType {
    id: number;
    name: string;
}

export interface TestType {
    id: number;
    name: string;
}

export interface Domain {
    id: string;
    name: string;
}

export interface Question {
    external_id: string;
    loaded: boolean;
    type: 'mcq' | 'spr';
    stimulus?: string;
    stem: string;
    image?: string;
    answerOptions?: { id: string; content: string }[];
    correct_answer: string[];
    rationale: string;
    domain: string;
}

export interface DomainPerformance {
    id: string;
    name: string;
    correct: number;
    total: number;
}

export interface PracticeState {
    currentQuestionIndex: number;
    elapsedTime: number;
    remainingTime: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    domainPerformance: Record<string, DomainPerformance>;
}