import { prisma } from '@helper/db';
import { Event } from 'types/event';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

export const createEvent = async (data: Event): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.create({
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

export const editEvent = async (data: Event): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to update event in database',
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
    const event: Event[] = await prisma.event.findMany({
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
    const event: Event[] = await prisma.event.findMany();

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
    const event: Event = await prisma.event.findUnique({
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
