import { numberToWeekday } from '@constants/weekdays';
import { monthNamesFull } from '@constants/months';
import moment from 'moment-timezone';

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

export const formatDateToString = (date: Date): string => {
  return moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');
};
