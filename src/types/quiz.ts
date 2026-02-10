export interface QuizImage {
  id: string;
  filename: string;
  type: 'T1' | 'T2';
  subject: string;
}

export interface ImageMetadata {
  images: QuizImage[];
  stats: { total: number; t1Count: number; t2Count: number };
}

export interface QuizItem {
  image: QuizImage;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  consecutiveCorrect: number;
  lastSeen: number | null;
  priority: number;
}

export type SessionLength = 20 | 50 | 100 | 'all';

export interface QuizState {
  items: QuizItem[];
  currentIndex: number;
  sessionLength: SessionLength;
  answers: AnswerRecord[];
  phase: 'setup' | 'question' | 'explanation' | 'results';
  score: number;
  totalAnswered: number;
}

export interface AnswerRecord {
  imageId: string;
  correct: boolean;
  userAnswer: 'T1' | 'T2';
  correctAnswer: 'T1' | 'T2';
  timestamp: number;
}

export type QuizAction =
  | { type: 'START_QUIZ'; sessionLength: SessionLength; images: QuizImage[] }
  | { type: 'ANSWER'; answer: 'T1' | 'T2' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_QUIZ' }
  | { type: 'RESET' };
