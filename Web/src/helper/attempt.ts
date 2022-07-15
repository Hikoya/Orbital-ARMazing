import { prisma } from '@helper/db';
import { Attempt } from 'types/attempt';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { log } from '@helper/log';

export const createAttempt = async (data: Attempt): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Attempt = await prisma.attempt.create({
      data: data,
    });

    if (event) {
      if (data.eventID !== undefined && event.id !== undefined) {
        await log('Unity', data.eventID, `Create Attempt ${event.id}`);
      }
      result = { status: true, error: null, msg: 'Success!' };
    } else {
      result = {
        status: false,
        error: 'Failed to create attempt in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create attempt in database', msg: null };
  }

  return result;
};

export const deleteAttempt = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    if (id !== undefined) {
      await log(session.user.email, id, `Delete Attempt ${id}`);
    }

    const attempt: Attempt = await prisma.attempt.delete({
      where: {
        id: id,
      },
    });

    if (attempt) {
      result = { status: true, error: null, msg: attempt };
    } else {
      result = {
        status: false,
        error: 'Failed to delete attempt in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete attempt in database', msg: null };
  }

  return result;
};

export const fetchAllAttemptByAssetID = async (
  assetID: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const att: Attempt[] = await prisma.attempt.findMany({
      where: {
        assetID: assetID,
      },
    });

    result = { status: true, error: null, msg: att };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch attempt in database', msg: null };
  }

  return result;
};

export const fetchAttemptByEventID = async (
  eventID: string,
  username: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const att: Attempt[] = await prisma.attempt.findMany({
      where: {
        eventID: eventID,
        username: username,
      },
    });

    result = { status: true, error: null, msg: att };
  } catch (error) {
    console.error(error);
    result = { status: false, error:  'Failed to fetch attempt in database', msg: null };
  }

  return result;
};

export const doesUserAttempt = async (
  eventID: string,
  username: string,
  assetID: string,
): Promise<boolean> => {
  let result = false;

  try {
    const att: Attempt = await prisma.attempt.findFirst({
      where: {
        eventID: eventID,
        username: username,
        assetID: assetID,
      },
    });

    if (att) {
      result = true;
    }
  } catch (error) {
    console.error(error);
    result = false;
  }

  return result;
};
