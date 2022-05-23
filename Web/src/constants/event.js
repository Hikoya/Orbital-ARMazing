import { prisma } from "@constants/db";

export const createEvent = async (data) => {
  try {
    const event = await prisma.event.create({
      data: data,
    });

    if (event) {
      return { status: true, error: null, msg: "Success!" };
    } else {
      return {
        status: false,
        error: "Failed to create event in database",
        msg: "",
      };
    }
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
