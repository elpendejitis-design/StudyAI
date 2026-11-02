export type AcademicLevel = 'secundaria' | 'bachillerato' | 'universidad' | 'autodidacta';

export type ActiveModule = 'dashboard' | 'summarizer' | 'tutor' | 'quiz' | 'flashcards' | 'library';

// Summary Types
export interface KeyConcept {
  term: string;
  definition: string;
  importance: 'alta' | 'media' | 'baja';
}

export interface StructuredSection {
  heading: string;
  points: string[];
}

export interface SummaryResult {
  id: string;
  timestamp: number;
  title: string;
  originalTextSnippet: string;
  executiveSummary: string;
  keyConcepts: KeyConcept[];
  structuredSections: StructuredSection[];
  conclusions: string[];
  reflectionQuestions: string[];
  level: 'sintetico' | 'intermedio' | 'detallado';
  sourceLength: number;
}

// Tutor Types
export type TutorPedagogyMode = 'paso-a-paso' | 'socratico' | 'analogia' | 'ejercicio';

export interface TutorMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  suggestedFollowUps?: string[];
  mode?: TutorPedagogyMode;
  subject?: string;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  concept: string;
}

export interface QuizExam {
  id: string;
  topic: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  questions: QuizQuestion[];
  createdAt: number;
}

export interface QuizAttempt {
  id: string;
  examId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  userAnswers: Record<number, number>;
  timestamp: number;
  difficulty: 'facil' | 'medio' | 'dificil';
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
  status?: 'nuevo' | 'dificil' | 'repaso' | 'dominado';
  lastReviewed?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  category: string;
  cards: Flashcard[];
  createdAt: number;
}

// User Local Preferences (Non-sensitive, browser stored)
export interface UserPreferences {
  academicLevel: AcademicLevel;
  demoMode: boolean; // demo mode toggle
  preferredModel?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
  dailyGoalCards: number;
  studiedToday: number;
  studyStreakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryAfter?: number;
  isDemoFallback?: boolean;
  canRetry?: boolean;
  usedModel?: string;
}
