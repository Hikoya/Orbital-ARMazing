import { prisma } from '@helper/db';
import { Session } from 'next-auth/core/types';
import { Asset } from 'types/asset';
import { Result } from 'types/api';
import { levels } from '@constants/admin';
import { fetchAllEventWPermission } from '@helper/permission';
import { EventPermission } from 'types/eventPermission';
import { filterDuplicates } from '@helper/common';
import { deleteQuiz, fetchAllQuizByAssetID } from '@helper/quiz';
import { Quiz } from 'types/quiz';

export const createAsset = async (data: Asset): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Asset = await prisma.assets.create({
      data: data,
    });

    if (event) {
      result = { status: true, error: null, msg: 'Success!' };
    } else {
      result = {
        status: false,
        error: 'Failed to create asset in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const editAsset = async (data: Asset): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const asset: Asset = await prisma.assets.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (asset) {
      result = { status: true, error: null, msg: 'Success!' };
    } else {
      result = {
        status: false,
        error: 'Failed to create asset in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const deleteAsset = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const quizzesRes: Result = await fetchAllQuizByAssetID(id);
  if (quizzesRes.status) {
    const quizzes: Quiz[] = quizzesRes.msg;
    if (quizzes.length > 0) {
      for (let key = 0; key < quizzes.length; key += 1) {
        if (quizzes[key]) {
          const quiz: Quiz = quizzes[key];
          if (quiz.id !== undefined) {
            await deleteQuiz(quiz.id);
          }
        }
      }
    }
  } else {
    console.log(quizzesRes.error);
  }

  try {
    const asset: Asset = await prisma.assets.delete({
      where: {
        id: id,
      },
    });

    if (asset) {
      result = { status: true, error: null, msg: 'Success!' };
    } else {
      result = {
        status: false,
        error: 'Failed to delete asset in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchAllAssetByUser = async (
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: null,
  };

  if (session.user.level === levels.ORGANIZER) {
    try {
      const asset: Asset[] = await prisma.assets.findMany({
        where: {
          createdBy: session.user.email,
        },
      });

      result = { status: true, error: null, msg: asset };
    } catch (error) {
      console.error(error);
      result = { status: false, error: error, msg: null };
    }
  } else if (session.user.level === levels.FACILITATOR) {
    try {
      const assetList: Asset[] = [];

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
              const asset: Asset[] = await prisma.assets.findMany({
                where: {
                  eventID: eventString,
                },
              });

              if (asset !== null && asset.length > 0) {
                for (let key = 0; key < asset.length; key += 1) {
                  if (asset[key]) {
                    const assetRes: Asset = asset[key];
                    assetList.push(assetRes);
                  }
                }
              }
            }
          }
        }

        result = { status: true, error: null, msg: assetList };
      } else {
        result = { status: false, error: listOfEventsRes.error, msg: null };
      }
    } catch (error) {
      console.error(error);
      result = { status: false, error: error.toString(), msg: null };
    }
  }

  return result;
};

export const fetchAllAsset = async (): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const asset: Asset[] = await prisma.assets.findMany();

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchAllAssetByEventID = async (
  eventID: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const asset: Asset[] = await prisma.assets.findMany({
      where: {
        eventID: eventID,
      },
    });

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchAssetByID = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const asset: Asset = await prisma.assets.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const countAsset = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const numberOfAssets: number = await prisma.assets.count({
      where: {
        eventID: id,
      },
    });

    result = { status: true, error: null, msg: numberOfAssets };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const isCreatorOfAsset = async (
  id: string,
  session: Session,
): Promise<boolean> => {
  const assetRes: Result = await fetchAssetByID(id);

  if (
    assetRes.status &&
    assetRes.msg !== null &&
    session !== undefined &&
    session !== null
  ) {
    const asset: Asset = assetRes.msg;
    return asset.createdBy === session.user.email;
  }

  return false;
};
