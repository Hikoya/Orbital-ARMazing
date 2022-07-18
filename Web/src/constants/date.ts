import { numberToWeekday } from '@constants/weekdays';
import { monthNamesFull } from '@constants/months';
import moment from 'moment-timezone';

/**
 * Checks whether the given Date object is valid by calling the
 * getTime() function and checking if the result is a number.
 *
 * @param d Date object
 * @return boolean on whether the object is a valid Date
 */
export const isValidDate = (d: Date): boolean => {
  if (Object.prototype.toString.call(d) === '[object Date]') {
    if (isNaN(d.getTime())) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

/**
 * Takes in a valid Date object and formats it into a readable
 * date string
 *
 * eg. Tuesday, 28 June 2022
 *
 * @param date Date object
 * @return string formatted in the desired format
 */
export const prettifyDate = (date: Date): string => {
  if (date && isValidDate(date)) {
    const dateObj = moment.tz(date, 'Asia/Singapore');
    const day = numberToWeekday[dateObj.day()];
    const month = monthNamesFull[dateObj.month()];
    const prettyDate = `${day}, ${dateObj.format(
      'DD',
    )} ${month} ${dateObj.year()}`;
    return prettyDate;
  }

  return `Unknown Date`;
};

/**
 * Takes in a valid Date string in YYYY-MM-DD format
 * and converts into a Unix timestamp to store in the database
 *
 * @param date String in YYYY-MM-DD format
 * @return UNIX timestamp of the date in seconds
 */
export const convertDateToUnix = (date: string): number => {
  const prettified = moment
    .tz(date, 'YYYY-MM-DD', true, 'Asia/Singapore')
    .startOf('day');
  if (prettified.isValid()) {
    return Math.floor(prettified.valueOf() / 1000);
  } else {
    return 0;
  }
};

/**
 * Takes in a number and converts back into a Date object if the
 * timestamp is valid
 *
 * @param date Date object
 * @return Date object if timestamp valid, null otherwise
 */
export const convertUnixToDate = (date: number): Date | null => {
  if (date < 0) {
    return null;
  }

  const converted = moment.tz(date * 1000, 'Asia/Singapore').startOf('day');
  if (converted.isValid()) {
    const today = moment.tz(new Date(), 'Asia/Singapore').startOf('day');
    const diff = converted.diff(today, 'years', true);
    if (diff > 1 || diff < -1) {
      return null;
    }
    return converted.toDate();
  } else {
    return null;
  }
};

/**
 * Takes in a valid Date object and formats it into a readable
 * date string in YYYY-MM-DD format
 *
 * eg. 2022-08-22
 *
 * @param date Date object
 * @return string formatted in the desired format
 */
export const formatDateToString = (date: Date): string => {
  return moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');
};
