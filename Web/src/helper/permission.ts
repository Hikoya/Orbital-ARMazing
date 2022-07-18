import { prisma } from '@helper/db';
import { EventPermission } from 'types/eventPermission';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';
import { levels } from '../constants/admin';

/**
 * Fetches all events that the user has permision in
 *
 * Permission is defined as:
 * User is Organizer and creator of Event
 * User is Facilitator and assigned to this Event
 *
 * @param session User Session
 * @return a Promise containing a Result
 */
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
    result = { status: false, error: 'Failed to get permissions', msg: null };
  }

  return result;
};
