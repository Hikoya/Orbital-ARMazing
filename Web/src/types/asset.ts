export type Asset = {
  id?: string;
  eventID: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  visible: boolean;
  visibleText?: string;
  imagePath?: string;
  createdBy?: string;
  action?: any;
};
