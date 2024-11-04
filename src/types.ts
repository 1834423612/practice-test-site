export interface AssessmentType {
    id: number;
    name: string;
}

export interface TestType {
    id: number;
    name: string;
}

export interface MathDomain {
    id: string;
    name: string;
}

export interface EnglishDomain {
    id: string;
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
    userAnswer?: string;
    isCorrect?: boolean;
}

export interface SATQuestion {
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

export interface AMCQuestion {
    id: string;
    question: string;
    options: { label: string; value: string }[];
    correct_option: string;
    solution: string[];
}

// export type Question = SATQuestion | AMCQuestion;

export interface DomainPerformance {
    id: string;
    name: string;
    correct: number;
    total: number;
}

export interface PracticeState {
    currentQuestionIndex: number;
    completedQuestions: Question[];
    domainPerformance: Record<string, DomainPerformance>;
    elapsedTime: number;
    remainingTime: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
}
