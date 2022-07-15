import { levels } from "@constants/admin";

export const checkerString = (data: string): boolean => {
  if (data !== null && data !== undefined) {
    const res = data.trim();
    return res !== '';
  } else {
    return false;
  }
};

export const checkerNumber = (data: number): boolean => {
  return !Number.isNaN(data) && data !== null && data !== undefined;
};

export const filterDuplicates = (data: any[]): any[] => {
  const uniqueArray = data.filter(function (item, pos) {
    return data.indexOf(item) == pos;
  });

  return uniqueArray;
};

export const fetchLevel = async (level: number): Promise<string> => {
  let result = '';

  const keys: string[] = Object.keys(levels);
  const values = Object.values(levels);

  for (let key = 0; key < keys.length; key += 1) {
    if (values[key] === level) {
      result = keys[key];
      break;
    }
  }

  return result;
}