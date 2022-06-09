import { prisma } from '@helper/db';

export const createAsset = async (data) => {
  try {
    const event = await prisma.assets.create({
      data: data,
    });

    if (event) {
      return { status: true, error: null, msg: 'Success!' };
    } else {
      return {
        status: false,
        error: 'Failed to create asset in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: null };
  }
};

export const fetchAllAsset = async (session) => {
  try {
    const asset = await prisma.assets.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    return { status: true, error: null, msg: asset };
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
