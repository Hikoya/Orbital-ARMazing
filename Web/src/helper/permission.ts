import { prisma } from '@helper/db';
import { EventPermission } from 'types/eventPermission';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';
import { levels } from '../constants/admin';

export const fetchAllEventWPermission = async (
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: EventPermission[] = await prisma.eventPermission.findMany({
      where: {
        email: session.user.email,
        level: levels.FACILITATOR,
      },
    });

    result = { status: true, error: null, msg: event };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};
