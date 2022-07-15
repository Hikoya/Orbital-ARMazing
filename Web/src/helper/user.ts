import { prisma } from '@helper/db';
import { Result } from 'types/api';
import { User } from 'types/user';

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
    const u: User = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        level: level,
      },
    });

    if (u) {
      result = { status: true, error: null, msg: 'Success!' };
    } else {
      result = { status: false, error: 'Failed to update level for user', msg: ''};
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update level for user', msg: null };
  }

  return result;
};

export const fetchAllUser = async (): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const allUser: User[] = await prisma.user.findMany();

    result = { status: true, error: null, msg: allUser };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch user', msg: null };
  }

  return result;
}

export const fetchUserByEmail = async (email: string) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const allUser: User = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });

    result = { status: true, error: null, msg: allUser };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch user', msg: null };
  }

  return result;
}