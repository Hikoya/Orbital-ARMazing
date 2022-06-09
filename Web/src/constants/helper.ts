import { numberToWeekday } from '@constants/weekdays';
import { monthNamesFull } from '@constants/months';

export const prettifyDate = (date) => {
  if (date) {
    const dateObj = new Date(date);
    const day = numberToWeekday[dateObj.getDay()];
    const month = monthNamesFull[dateObj.getMonth()];
    const prettyDate = `${day}, ${dateObj.getDate()} ${month} ${dateObj.getFullYear()}`;
    return prettyDate;
  }
};

export const convertDateToUnix = (date) => {
  const prettified = prettifyDate(date);
  const parseDate = Date.parse(prettified);
  return Math.floor(parseDate / 1000);
};

export const convertUnixToDate = (date) => {
  return new Date(date * 1000);
};
