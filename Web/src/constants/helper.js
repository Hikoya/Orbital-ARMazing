import { getSession } from "next-auth/react";
import { numberToWeekday } from "@constants/weekdays";
import { monthNamesFull } from "@constants/months";

export const currentSession = async (req = null) => {
  var session = null;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    session = {
      expires: "1",
      user: {
        username: "Test user",
        email: "testing@test.com",
        admin: true,
      },
    };
  } else {
    const isServer = typeof window === "undefined";
    let session = null;
    if (isServer && req) {
      session = await getSession({ req });
    } else {
      session = await getSession();
    }

    return session;
  }

  return session;
};

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