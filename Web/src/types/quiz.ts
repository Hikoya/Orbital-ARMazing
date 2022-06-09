export type Quiz = {
  eventID: string;
  question: string;
  options: string;
  answer: number;
  points: number;
  visible: boolean;
  createdBy: string;
};

export type QuizFetch = {
  id: string;
  event: string;
  eventID: string;
  question: string;
  options: string;
  answer: number;
  points: number;
  visible: boolean;
  isVisible: string;
};
