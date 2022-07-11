import { prisma } from '@helper/db';

import { Event } from 'types/event';
import { Result } from 'types/api';
import { EventPermission } from 'types/eventPermission';
import { Asset } from 'types/asset';

import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';

import { fetchAllEventWPermission } from '@helper/permission';
import { filterDuplicates } from '@helper/common';
import { deleteAsset, fetchAllAssetByEventID } from '@helper/asset';
import { deleteLeaderBoardByEventID } from '@helper/leaderboard';
import { log } from '@helper/log';

export const createEvent = async (
  data: Event,
  session: Session,
): Promise<Result> => {
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
      if (event.id !== undefined) {
        await log(session.user.email, event.id, `Create Event ${event.id}`);
      }
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
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const editEvent = async (
  data: Event,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    if (data.id !== undefined) {
      await log(session.user.email, data.id, `Edit Event ${data.id}`);
    }

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
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const deleteEvent = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const assetRes: Result = await fetchAllAssetByEventID(id);
  if (assetRes.status) {
    const assets: Asset[] = assetRes.msg;
    if (assets.length > 0) {
      for (let key = 0; key < assets.length; key += 1) {
        if (assets[key]) {
          const asset: Asset = assets[key];
          if (asset.id !== undefined) {
            await deleteAsset(asset.id, session);
          }
        }
      }
    }
  } else {
    console.log(assetRes.error);
  }

  const leaderBoardRes: Result = await deleteLeaderBoardByEventID(id, session);
  if (!leaderBoardRes.status) {
    console.log(leaderBoardRes.error);
  }

  try {
    await log(session.user.email, id, `Delete Event ${id}`);

    const event: Event = await prisma.event.delete({
      where: {
        id: id,
      },
    });

    if (event) {
      result = { status: true, error: null, msg: event };
    } else {
      result = {
        status: false,
        error: 'Failed to delete event in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
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
      result = { status: false, error: error.toString(), msg: null };
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
    result = { status: false, error: error.toString(), msg: null };
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
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

export const fetchEventByCode = async (eventCode: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const event: Event = await prisma.event.findUnique({
      where: {
        eventCode: eventCode,
      },
    });

    result = { status: true, error: null, msg: event };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: null };
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

export const isCreatorOfEvent = async (
  id: string,
  session: Session,
): Promise<boolean> => {
  const eventRes: Result = await fetchEventByID(id);

  if (
    eventRes.status &&
    eventRes.msg !== null &&
    session !== undefined &&
    session !== null
  ) {
    const event: Event = eventRes.msg;
    return event.createdBy === session.user.email;
  }

  return false;
};

export const isCodeTaken = async (code: string): Promise<boolean> => {
  let result: boolean = true;

  try {
    const event: Event = await prisma.event.findUnique({
      where: {
        eventCode: code,
      },
    });

    if (event) {
      result = true;
    } else {
      result = false;
    }
  } catch (error) {
    console.error(error);
    result = true;
  }

  return result;
};

export const generateEventCode = async (): Promise<string> => {
  let code: string = '';
  const maxLength = 6;
  const maxDigit = 9;
  for (let i = 0; i < maxLength; i += 1) {
    const num: number = Math.floor(Math.random() * maxDigit);
    code += num.toString();
  }

  const isTaken: boolean = await isCodeTaken(code);

  return isTaken ? await generateEventCode() : code;
};
