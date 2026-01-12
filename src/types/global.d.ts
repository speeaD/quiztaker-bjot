/* eslint-disable @typescript-eslint/no-explicit-any */
// Duration type for quiz timing
export interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

// Quiz reference in assigned quiz
export interface QuizReference {
  _id: string;
  settings: QuizSettings;
}

// Submission details for completed quizzes
export interface Submission {
  _id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt?: string;
  focusLostCount?: number;
  timeTaken?: number;
}


// Quiz status types
export type QuizStatus = 'pending' | 'in-progress' | 'completed';

// Assigned quiz interface
export interface AssignedQuiz {
  _id: string;
  quizId: QuizReference;
  status: QuizStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  submissionId?: Submission;
}

// Quiz taker profile interface
export interface QuizTaker {
  id: string;
  email: string;
  accessCode: string;
  assignedQuizzes: AssignedQuiz[];
  createdAt: string;
}

// Dashboard API response interface
export interface DashboardResponse {
  quizTaker: QuizTaker;
}

// Stats interface for dashboard statistics
export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgScore: number;
}

// Tab types for filtering
export type TabKey = 'all' | 'pending' | 'in-progress' | 'completed';

// Tab configuration interface
export interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

// Status badge configuration
export interface StatusConfig {
  color: string;
  icon: React.ComponentType<{ size?: number }>;
  text: string;
}

interface QuizSettings {
  coverImage: string;
  title: string;
  isQuizChallenge: boolean;
  description: string;
  instructions: string;
  duration: Duration;
  multipleAttempts: boolean;
  looseFocus: boolean;
  viewAnswer: boolean;
  viewResults: boolean;
  displayCalculator: boolean;
}

interface Question {
  _id: string;
  type: 'multiple-choice' | 'essay' | 'true-false' | 'fill-in-the-blanks';
  question: string;
  options?: string[];
  correctAnswer?: any;
  points: number;
  order: number;
}

interface Quiz {
  _id: string;
  settings: QuizSettings;
  questions: Question[];
  totalPoints: number;
}



export interface ApiError {
  error: string;
  message?: string;
}

export interface StartQuizResponse {
  message: string;
  assignedQuiz: AssignedQuiz;
}

export interface SubmitQuizRequest {
  answers: Array<{
    questionId: string;
    answer: any;
  }>;
}

export interface SubmitQuizResponse {
  success: true;
  message: string;
  submission: {
    id: string;
    score: number;
    totalPoints: number;
    percentage: number;
    timeTaken: number;
    status: 'auto-graded' | 'pending-manual-grading' | 'graded';
  };
}


export interface QuizDetailsResponse {
  quiz: Quiz;
  assignmentStatus: string;
}

// Result types
export interface QuestionResult {
  question: Question;
  userAnswer: any;
  correctAnswer?: any;
  isCorrect: boolean;
  pointsAwarded: number;
  flagged: boolean;
}

export interface QuizResultsResponse {
  submission: Submission;
  quiz: Quiz;
  results: QuestionResult[];
  quizSettings: QuizSettings;
}
// types/quiz.ts

export type QuestionType = 'multiple-choice' | 'essay' | 'true-false' | 'fill-in-the-blanks';

export type QuestionSetStatus = 'not-started' | 'in-progress' | 'completed';

export interface Question {
  _id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  points: number;
  order: number;
}

export interface QuestionSet {
  _id: string;
  title: string;
  order: number;
  totalPoints: number;
  questions: Question[];
}

export interface QuestionSetOverview {
  _id: string;
  questionSetId: string;
  title: string;
  order: number;
  totalPoints: number;
  questionCount: number;
}

export interface QuestionSetProgress {
  questionSetOrder: number;
  selectedOrder?: number;
  status: QuestionSetStatus;
  startedAt?: string;
  completedAt?: string;
  score: number;
  totalPoints: number;
  percentage?: number;
}

export interface QuizSettings {
  coverImage?: string;
  title: string;
  isQuizChallenge: boolean;
  description?: string;
  instructions?: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  multipleAttempts: boolean;
  looseFocus: boolean;
  viewAnswer: boolean;
  viewResults: boolean;
  displayCalculator: boolean;
}

export interface Quiz {
  _id: string;
  settings: QuizSettings;
  questionSets: QuestionSetOverview[];
  totalPoints: number;
}

export interface QuizProgress {
  quizId: string;
  quizTitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  selectedQuestionSetOrder: number[];
  currentQuestionSetOrder?: number;
  questionSets: QuestionSetProgress[];
  overallProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface Answer {
  questionId: string;
  answer: string | boolean;
}

export interface SubmitQuestionSetRequest {
  answers: Answer[];
  questionSetOrder: number;
  isFinalSubmission: boolean;
}

export interface SubmitQuestionSetResponse {
  success: boolean;
  message: string;
  submission: {
    id: string;
    questionSetScore: number;
    questionSetTotalPoints: number;
    overallScore: number;
    overallTotalPoints: number;
    percentage: number;
    timeTaken: number;
    status: string;
    isFinalSubmission: boolean;
  };
}

export interface QuizApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}