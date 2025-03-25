export type Subject = 'M1' | 'M2' | 'L' | 'CB' | 'CF' | 'CQ' | 'H' | 'ALL';
export type PracticeMode = 'PAES' | 'TEST' | 'REVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  grade?: string;
}

export interface Question {
  id: string;
  subject: Subject;
  content: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  areaTematica?: string;
  tema?: string;
  subtema?: string;
  difficulty?: number;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  sessionId: string;
  questionId: string;
  subject: Subject;
  mode: PracticeMode;
  areaTematica?: string;
  tema?: string;
  subtema?: string;
  answer: 'a' | 'b' | 'c' | 'd';
  isCorrect: boolean;
  timeSpent: number;
  createdAt: string;
}