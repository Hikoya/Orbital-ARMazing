import { prisma } from "@helper/db";

export const createQuiz = async (data) => {
  try {
    const qn = await prisma.questions.create({
      data: data,
    });

    if (qn) {
      return { status: true, error: null, msg: qn };
    } else {
      return {
        status: false,
        error: "Failed to create question in database",
        msg: "",
      };
    }
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
