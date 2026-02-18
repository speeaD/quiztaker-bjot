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


export interface Subject {
  id: string;
  name: string;
  questionCount: number;
}

export interface GameSession {
  id: string;
  subject: string;
  currentScore: number;
  goalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  status: 'active' | 'won' | 'lost' | 'abandoned';
  totalQuestions?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface QuestionResponse {
  success: boolean;
  question: Question;
  currentScore: number;
  goalScore: number;
  questionsAnswered: number;
  questionsRemaining: number;
  gameOver?: boolean;
  finalScore?: number;
  status?: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  pointsChange: number;
  newScore: number;
  status: string;
}

export interface GameHistory {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  wager: number;
  isCorrect: boolean;
  pointsChange: number;
  timestamp: string;
}

export type Department = 'Sciences' | 'Arts' | 'Commercial';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DayName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface QuestionSet {
  _id: string;
  title: string;
  subject?: string;
}

export interface ClassSession {
  _id: string;
  dayOfWeek: DayOfWeek;
  dayName: DayName;
  questionSet: string | QuestionSet;
  questionSetTitle: string;
  startTime: string; // "19:00"
  endTime: string; // "21:00"
  isActive: boolean;
}

export interface Schedule {
  _id: string;
  department: Department;
  weeklySchedule: ClassSession[];
  overrides: ScheduleOverride[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOverride {
  _id: string;
  date: string;
  classSession: ClassSession;
  reason: string;
}

export interface AttendanceWindow {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  closedBy?: string;
  durationMinutes: number;
  bufferMinutes: number;
}

export interface WindowHistory {
  action: 'opened' | 'closed';
  timestamp: string;
  admin?: string;
}

export interface AttendanceSession {
  _id: string;
  department: Department;
  questionSet: string | QuestionSet;
  questionSetTitle: string;
  date: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  attendanceWindow: AttendanceWindow;
  windowHistory: WindowHistory[];
  status: SessionStatus;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  session: string | AttendanceSession;
  student: string;
  studentName: string;
  studentEmail: string;
  department: Department;
  status: AttendanceStatus;
  markedBy: 'student' | 'admin';
  admin?: string;
  markedAt: string;
  isLate: boolean;
  minutesLate: number;
  notes: string;
  createdAt: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  department: Department;
  accountType: 'premium' | 'regular';
  isActive: boolean;
}

export interface SessionWithAttendanceStatus extends AttendanceSession {
  attendanceMarked: boolean;
  attendanceStatus: AttendanceStatus | null;
  markedAt: string | null;
  isLate: boolean;
}

export interface AttendanceStatistics {
  total: number;
  present: number;
  absent: number;
  percentage: string;
}

export interface SessionAttendanceData {
  session: AttendanceSession;
  presentRecords: AttendanceRecord[];
  absentStudents: Student[];
  statistics: AttendanceStatistics;
}

export interface StudentAttendanceHistory {
  records: AttendanceRecord[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
  statistics: {
    totalClasses: number;
    present: number;
    attendancePercentage: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Form types
export interface CreateScheduleForm {
  department: Department;
  weeklySchedule: {
    dayOfWeek: DayOfWeek;
    dayName: DayName;
    questionSet: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
}

export interface OpenWindowForm {
  durationMinutes?: number;
  bufferMinutes?: number;
}