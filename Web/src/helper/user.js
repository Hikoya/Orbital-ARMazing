import { prisma } from "@helper/db";

export const updateUserLevel = async (session, level) => {
  try {
    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        user: level,
      },
    });

    if (user) {
      return { status: true, error: null, msg: "Success!" };
    } else {
      return {
        status: false,
        error: "Failed to update level",
        msg: "",
      };
    }
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
