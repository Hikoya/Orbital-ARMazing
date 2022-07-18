import { levels } from '@constants/admin';

/**
 * Check whether the string is valid.
 *
 * The conditions of whether the string is valid is:
 * 1. Must not be null
 * 2. Must not be undefined
 * 3. Must not be empty string eg. ''
 *
 * @param data String
 * @return boolean on whether valid string
 */
export const checkerString = (data: string): boolean => {
  if (data !== null && data !== undefined) {
    const res = data.trim();
    return res !== '';
  }
  return false;
};

/**
 * Check whether the number is valid
 *
 * The conditions of whether the string is valid is:
 * 1. Must not be null
 * 2. Must not be undefined
 * 3. Must not be NAN when using the Number function
 *
 * @param data number
 * @return boolean on whether valid number
 */
export const checkerNumber = (data: number): boolean => {
  return !Number.isNaN(data) && data !== null && data !== undefined;
};

/**
 * Filter out any duplicate entries and returns an array containing
 * unique elements
 *
 * @param data an array of any data type
 * @return an array of the same type with unique elements
 */
export const filterDuplicates = (data: any[]): any[] => {
  const uniqueArray = data.filter(function (item, pos) {
    return data.indexOf(item) == pos;
  });

  return uniqueArray;
};

/**
 * Translate an integer to the respective user permission levels
 *
 * eg. 0 is USER, 1 is FACILITATOR
 *
 * @param level a number
 * @return a Promise containing a string of the role
 */
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
};
