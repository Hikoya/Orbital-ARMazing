export type Asset = {
  id?: string;
  eventID: string | string[];
  name: string | string[];
  description: string | string[];
  latitude: string | string[];
  longitude: string | string[];
  visible: boolean;
  visibleText?: string;
  imagePath?: string;
  createdBy?: string;
};
