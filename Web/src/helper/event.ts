import { prisma } from '@helper/db';
import { Event, EventCreate, EventFetch, EventJoined } from 'types/event';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

export const createEvent = async (data: Event): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventCreate = await prisma.event.create({
      data: data,
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to create event in database',
        msg: '',
      };
    }
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchAllEventByUser = async (
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventFetch[] = await prisma.event.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    result = { status: true, error: null, msg: event };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchAllEvent = async (): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventFetch[] = await prisma.event.findMany();

    result = { status: true, error: null, msg: event };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchEventByID = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventFetch = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: event };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const joinEvent = async (
  session: Session,
  eventID: string,
  level: number,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventJoined = await prisma.eventsJoined.create({
      data: {
        userEmail: session.user.email,
        eventIDname: eventID,
        level: level,
      },
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to insert into database!',
        msg: null,
      };
    }
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};
