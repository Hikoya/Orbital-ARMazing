import { numberToWeekday } from '@constants/weekdays';
import { monthNamesFull } from '@constants/months';

export const prettifyDate = (date: Date): string => {
  if (date) {
    const dateObj = new Date(date);
    const day = numberToWeekday[dateObj.getDay()];
    const month = monthNamesFull[dateObj.getMonth()];
    const prettyDate = `${day}, ${dateObj.getDate()} ${month} ${dateObj.getFullYear()}`;
    return prettyDate;
  }
};

export const convertDateToUnix = (date: Date): number => {
  const prettified = prettifyDate(date);
  const parseDate = Date.parse(prettified);
  return Math.floor(parseDate / 1000);
};

export const convertUnixToDate = (date: number): Date => {
  return new Date(date * 1000);
};
