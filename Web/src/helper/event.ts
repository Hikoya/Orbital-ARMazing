import { prisma } from '@helper/db';

export const createEvent = async (data) => {
  try {
    const event = await prisma.event.create({
      data: data,
    });

    if (event) {
      return { status: true, error: null, msg: event };
    } else {
      return {
        status: false,
        error: 'Failed to create event in database',
        msg: '',
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

export const fetchEventByID = async (id) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    return { status: true, error: null, msg: event };
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};

export const joinEvent = async (session, eventID, level) => {
  try {
    const event = await prisma.eventsJoined.create({
      data: {
        userEmail: session.user.email,
        eventIDname: eventID,
        level: level,
      },
    });

    if (event) {
      return { status: true, error: null, msg: event };
    }

    return {
      status: false,
      error: 'Failed to insert into database!',
      msg: null,
    };
  } catch (error) {
    return { status: false, error: error, msg: null };
  }
};
