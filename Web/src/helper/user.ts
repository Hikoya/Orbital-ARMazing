import { prisma } from '@helper/db';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

export const updateUserLevel = async (
  session: Session,
  level: number,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        user: level,
      },
    });

    result = { status: true, error: null, msg: 'Success!' };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};
