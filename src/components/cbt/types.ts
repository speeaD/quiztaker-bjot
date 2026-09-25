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
  passage?: string;
  diagram?: string | null;
  diagramAlt?: string;
  options?: string[];
  points: number;
  order: number;
}
