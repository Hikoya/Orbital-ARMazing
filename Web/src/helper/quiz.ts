import { prisma } from '@helper/db';
import { Quiz } from 'types/quiz';
import { Result } from 'types/api';
import { EventPermission } from 'types/eventPermission';

import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';

import { fetchAllEventWPermission } from '@helper/permission';
import { filterDuplicates } from '@helper/common';
import { log } from '@helper/log';

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
      if (
        qn.id !== undefined &&
        data.eventID !== undefined &&
        data.createdBy !== undefined
      ) {
        await log(data.createdBy, data.eventID, `Create Quiz ${qn.id}`);
      }

      result = { status: true, error: null, msg: qn };
    } else {
      result = {
        status: false,
        error: 'Failed to create question in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create question in database', msg: null };
  }

  return result;
};

export const editQuiz = async (
  data: Quiz,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    if (data.eventID !== undefined && data.id !== undefined) {
      await log(session.user.email, data.eventID, `Edit Quiz ${data.id}`);
    }

    const qn: Quiz = await prisma.questions.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (qn) {
      result = { status: true, error: null, msg: qn };
    } else {
      result = {
        status: false,
        error: 'Failed to update question in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update question in database', msg: null };
  }

  return result;
};

export const deleteQuiz = async (
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
      await log(session.user.email, id, `Delete Quiz ${id}`);
    }

    const qn: Quiz = await prisma.questions.delete({
      where: {
        id: id,
      },
    });

    if (qn) {
      result = { status: true, error: null, msg: qn };
    } else {
      result = {
        status: false,
        error: 'Failed to delete question in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete question in database', msg: null };
  }

  return result;
};

export const fetchAllQuiz = async (session: Session): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session.user.level === levels.ORGANIZER) {
    try {
      const qn: Quiz[] = await prisma.questions.findMany({
        where: {
          createdBy: session.user.email,
        },
      });

      result = { status: true, error: null, msg: qn };
    } catch (error) {
      console.error(error);
      result = { status: false, error: 'Failed to find question in database', msg: null };
    }
  } else if (session.user.level === levels.FACILITATOR) {
    try {
      const quizList: Quiz[] = [];

      const listOfEventsRes: Result = await fetchAllEventWPermission(session);
      if (listOfEventsRes.status) {
        const listOfEvents: EventPermission[] = listOfEventsRes.msg;
        const eventID: string[] = [];

        if (listOfEvents !== null && listOfEvents.length > 0) {
          for (let key = 0; key < listOfEvents.length; key += 1) {
            if (listOfEvents[key]) {
              const event: EventPermission = listOfEvents[key];
              eventID.push(event.eventID);
            }
          }
        }

        const removeDup: string[] = filterDuplicates(eventID);
        if (removeDup.length > 0) {
          for (let key = 0; key < removeDup.length; key += 1) {
            if (removeDup[key]) {
              const eventString: string = removeDup[key];
              const quizzes: Quiz[] = await prisma.questions.findMany({
                where: {
                  eventID: eventString,
                },
              });

              if (quizzes !== null && quizzes.length > 0) {
                for (let key = 0; key < quizzes.length; key += 1) {
                  if (quizzes[key]) {
                    const quizzesRes: Quiz = quizzes[key];
                    quizList.push(quizzesRes);
                  }
                }
              }
            }
          }
        }

        result = { status: true, error: null, msg: quizList };
      } else {
        result = { status: false, error: '', msg: null };
      }
    } catch (error) {
      console.error(error);
      result = { status: false, error: 'Failed to find question in database', msg: null };
    }
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

    if (qn && qn.length > 0) {
      result = { status: true, error: null, msg: qn };
    } else {
      result = { status: true, error: null, msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find question in database', msg: null };
  }

  return result;
};

export const fetchAllQuizByAssetID = async (
  assetID: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const qn: Quiz[] = await prisma.questions.findMany({
      where: {
        assetID: assetID,
      },
    });

    result = { status: true, error: null, msg: qn };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find question in database', msg: null };
  }

  return result;
};

export const fetchQuizByID = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const qn = await prisma.questions.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: qn };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find question in database', msg: null };
  }

  return result;
};

export const isCreatorOfQuiz = async (
  id: string,
  session: Session,
): Promise<boolean> => {
  const qnRes: Result = await fetchQuizByID(id);
  if (
    qnRes.status &&
    qnRes.msg !== null &&
    session !== undefined &&
    session !== null
  ) {
    const qn: Quiz = qnRes.msg;
    return qn.createdBy === session.user.email;
  }

  return false;
};

export const countQuiz = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const numberOfQuiz: number = await prisma.questions.count({
      where: {
        eventID: id,
      },
    });

    result = { status: true, error: null, msg: numberOfQuiz };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to count question in database', msg: 0 };
  }

  return result;
};
