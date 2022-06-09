import { prisma } from '@helper/db';

export const createQuiz = async (data) => {
  try {
    console.log(data);

    const qn = await prisma.questions.create({
      data: data,
    });

    if (qn) {
      return { status: true, error: null, msg: qn };
    } else {
      return {
        status: false,
        error: 'Failed to create question in database',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: null };
  }
};

export const fetchAllQuiz = async (session) => {
  try {
    const qn = await prisma.questions.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    return { status: true, error: null, msg: qn };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: null };
  }
};
