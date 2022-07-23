export type Asset = {
  id?: string;
  eventName?: string;
  eventID: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  visible: boolean;
  visibleText?: string;
  imagePath?: string;
  createdBy?: string;
  quizCompleted?: boolean;
  action?: any;
  updated_at?: string;
};
