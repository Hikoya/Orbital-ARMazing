import { prisma } from '@helper/db';
import { Session } from 'next-auth/core/types';
import { Asset } from 'types/asset';
import { Result } from 'types/api';

export const createAsset = async (data: Asset): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event = await prisma.assets.create({
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
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchAllAssetByUser = async (
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const asset = await prisma.assets.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    result = { status: false, error: error, msg: null };
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
    const asset = await prisma.assets.findMany();

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    result = { status: false, error: error, msg: null };
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
    const asset = await prisma.assets.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: asset };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const countAsset = async (session: Session): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const numberOfAssets: number = await prisma.assets.count({
      where: {
        createdBy: session.user.email,
      },
    });

    result = { status: true, error: null, msg: numberOfAssets };
  } catch (error) {
    result = { status: false, error: error, msg: null };
  }

  return result;
};
