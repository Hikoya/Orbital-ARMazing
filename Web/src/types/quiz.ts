export type Quiz = {
  id?: string;
  assetID?: string;
  asset?: string;
  event?: string;
  eventID: string;
  question: string;
  options?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: number;
  points: number;
  visible: boolean;
  isVisible?: string;
  createdBy?: string;
};
