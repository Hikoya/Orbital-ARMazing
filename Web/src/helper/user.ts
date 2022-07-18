import { prisma } from '@helper/db';
import { Result } from 'types/api';
import { User } from 'types/user';

/**
 * Updates the user level.
 *
 * Level is a number indicating the role granted.
 * eg. 0 for USER
 *
 * @param email Email of user
 * @param level Permission level
 * @return a Promise containing a Result
 */
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
      result = {
        status: false,
        error: 'Failed to update level for user',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to update level for user',
      msg: null,
    };
  }

  return result;
};

/**
 * Fetches all users
 *
 * @return a Promise containing a Result
 */
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
};

/**
 * Fetches user filtered by email
 *
 * @param email Email of user
 * @return a Promise containing a Result
 */
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
      },
    });

    result = { status: true, error: null, msg: allUser };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch user', msg: null };
  }

  return result;
};
