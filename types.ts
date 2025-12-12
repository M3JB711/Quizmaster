export enum AppStep {
  UPLOAD = 'UPLOAD',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export type QuizViewMode = 'single' | 'all';
export type AssessmentType = 'quiz' | 'exam';

export interface QuizConfig {
  questionCount: number;
  language: 'English' | 'Arabic';
  viewMode: QuizViewMode;
  assessmentType: AssessmentType;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
  explanation: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  userAnswers: Record<number, number>; // Question Index -> Option Index
  score: number;
  total: number;
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
  extractedText?: string; // Used for PPTX content
}