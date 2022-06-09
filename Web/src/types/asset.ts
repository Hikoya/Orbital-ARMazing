export type Asset = {
  eventID: string | string[];
  name: string | string[];
  description: string | string[];
  latitude: string | string[];
  longitude: string | string[];
  visible: boolean;
  imagePath: string;
  createdBy: string;
};

export type AssetFetch = {
  id: string;
  eventID: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  visible: boolean;
  visibleText: string;
};
