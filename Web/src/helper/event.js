import { prisma } from "@helper/db";

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

export const fetchAllEvent = async (session) => {
  try {
    const event = await prisma.event.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    return { status: true, error: null, msg: event };
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};

export const joinEvent = async (session, eventID) => {
  try {
    const event = await prisma.eventsJoined.findMany({
      data: {
        userEmail: session.user.email,
        eventIDname: eventID,
      },
    });

    if (event) {
      return { status: true, error: null, msg: event };
    }

    return {
      status: false,
      error: "Failed to insert into database!",
      msg: null,
    };
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
