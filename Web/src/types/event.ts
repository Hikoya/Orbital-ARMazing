export type Event = {
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  isPublic: boolean;
  visible: boolean;
  createdBy: string;
};

export type EventFetch = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  visible: boolean;
  isPublicText: string;
  visibleText: string;
};
