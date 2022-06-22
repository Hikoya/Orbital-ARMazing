import { prisma } from '@helper/db';

import { Event } from 'types/event';
import { Result } from 'types/api';
import { EventPermission } from 'types/eventPermission';

import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';
import { fetchAllEventWPermission } from '@helper/permission';
import { filterDuplicates } from './common';

export const createEvent = async (data: Event): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.create({
      data: data,
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to create event in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const editEvent = async (data: Event): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to update event in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchAllEventByUser = async (
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session.user.level === levels.ORGANIZER) {
    try {
      const event: Event[] = await prisma.event.findMany({
        where: {
          createdBy: session.user.email,
        },
      });

      result = { status: true, error: null, msg: event };
    } catch (error) {
      console.error(error);
      result = { status: false, error: error, msg: null };
    }
  } else if (session.user.level === levels.FACILITATOR) {
    try {
      const resEvents: Event[] = [];

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
              const eventRes: Result = await fetchEventByID(eventString);
              if (eventRes.status) {
                const eventResMsg: Event = eventRes.msg;
                resEvents.push(eventResMsg);
              }
            }
          }
        }

        result = { status: true, error: null, msg: resEvents };
      } else {
        result = { status: false, error: '', msg: null };
      }
    } catch (error) {
      console.error(error);
      result = { status: false, error: error, msg: null };
    }
  }

  return result;
};

export const fetchAllEvent = async (): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event[] = await prisma.event.findMany();

    result = { status: true, error: null, msg: event };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const fetchEventByID = async (id: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: event };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const isEventAuthorized = async (
  event: Event,
  session: Session,
): Promise<boolean> => {
  if (session.user.level === levels.ORGANIZER) {
    return event.createdBy === session.user.email;
  } else if (session.user.level === levels.FACILITATOR) {
    const listOfEventsRes: Result = await fetchAllEventWPermission(session);
    if (listOfEventsRes.status && listOfEventsRes.msg !== null) {
      const listOfEvents: EventPermission[] = listOfEventsRes.msg;
      if (listOfEvents.length > 0) {
        for (let key = 0; key <= listOfEvents.length; key += 1) {
          if (listOfEvents[key]) {
            const eventPerm: EventPermission = listOfEvents[key];
            if (eventPerm.eventID === event.id) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
};
