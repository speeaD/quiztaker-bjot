export interface CbtQuestionSet {
  _id: string;
  title: string;
  questionCount: number;
  totalPoints: number;
}

export interface CbtQuestion {
  _id: string;
  type: string;
  question: string;
  options?: string[];
  points: number;
  order: number;
}
