import { prisma } from '@helper/db';
import { Result } from 'types/api';

export const updateUserLevel = async (
  email: string,
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
        email: email,
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
