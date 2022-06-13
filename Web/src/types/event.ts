export type Event = {
  id?: string;
  name: string;
  description: string;
  startDate: number | string;
  endDate: number | string;
  isPublic: boolean;
  visible: boolean;
  createdBy?: string;
  isPublicText?: string;
  visibleText?: string;
};
