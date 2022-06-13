import { prisma } from '@helper/db';
import { Quiz } from 'types/quiz';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

export const createQuiz = async (data: Quiz): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const qn: Quiz = await prisma.questions.create({
      data: data,
    });

    if (qn) {
      result = { status: true, error: null, msg: qn };
    } else {
      result = {
        status: false,
        error: 'Failed to create question in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchAllQuiz = async (session: Session): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const qn: Quiz[] = await prisma.questions.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    result = { status: true, error: null, msg: qn };
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchAllQuizByEvent = async (eventID: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const qn: Quiz[] = await prisma.questions.findMany({
      where: {
        eventID: eventID,
      },
    });

    result = { status: true, error: null, msg: qn };
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};
