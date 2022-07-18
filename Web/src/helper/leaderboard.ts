import { prisma } from '@helper/db';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Leaderboard } from 'types/leaderboard';
import { fetchEventByID, fetchEventByCode } from '@helper/event';

import { log } from '@helper/log';
import { Session } from 'next-auth/core/types';

/**
 * Checks whether the user is already registered under the event
 *
 * @param eventID Event ID
 * @param username Username of player
 * @return a Promise containing a Result
 */
export const doesUserExist = async (
  eventID: string,
  username: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const user: Leaderboard[] = await prisma.leaderboard.findMany({
      where: {
        username: username,
        eventID: eventID,
      },
    });

    if (user.length === 0) {
      result = {
        status: false,
        error: 'User does not exist!',
        msg: null,
      };
    } else {
      result = {
        status: true,
        error: 'User already exists in database!',
        msg: user,
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find user!', msg: null };
  }

  return result;
};

/**
 * Registers the player under the event
 *
 * @param eventCode Event Code
 * @param user Username of player
 * @return a Promise containing a Result
 */
export const joinEvent = async (
  eventCode: string,
  user: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const doesEventRes: Result = await fetchEventByCode(eventCode);
  if (doesEventRes.status && doesEventRes.msg !== null) {
    const doesEvent: Event = doesEventRes.msg;
    if (doesEvent.id !== undefined) {
      const doesUser: Result = await doesUserExist(doesEvent.id, user);

      if (doesUser.status) {
        result = { status: false, error: doesUser.error, msg: null };
      } else {
        try {
          await log(user, doesEvent.id, 'Join Event');

          const event: Leaderboard = await prisma.leaderboard.create({
            data: {
              username: user,
              eventID: doesEvent.id,
            },
          });

          if (event) {
            result = { status: true, error: null, msg: event };
          } else {
            result = {
              status: false,
              error: 'Failed to insert into database!',
              msg: null,
            };
          }
        } catch (error) {
          console.error(error);
          result = {
            status: false,
            error: 'Failed to insert player into leaderboard!',
            msg: null,
          };
        }
      }
    } else {
      result = {
        status: false,
        error: 'Event does not exist',
        msg: null,
      };
    }
  } else {
    result = {
      status: false,
      error: 'Event does not exist',
      msg: null,
    };
  }

  return result;
};

/**
 * Fetches the leaderboard filtered by the Event ID
 *
 * @param eventID Event ID
 * @return a Promise containing a Result
 */
export const fetchLeaderBoardByEventID = async (
  eventID: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const board: Leaderboard[] = await prisma.leaderboard.findMany({
      where: {
        eventID: eventID,
      },
      orderBy: {
        points: 'desc',
      },
      take: 10,
    });

    if (board && board.length > 0) {
      const boardResult: Leaderboard[] = [];
      for (let key = 0; key < board.length; key += 1) {
        if (board[key]) {
          const leaderBoard = board[key];
          const event: Result = await fetchEventByID(leaderBoard.eventID);
          if (event.status) {
            const eventMsg: Event = event.msg;
            const eventName: string = eventMsg.name;

            boardResult.push({
              id: leaderBoard.id,
              eventID: leaderBoard.eventID,
              eventName: eventName,
              points: leaderBoard.points,
              username: leaderBoard.username,
            });
          }
        }
      }
      result = { status: true, error: null, msg: boardResult };
    } else if (board && board.length === 0) {
      result = {
        status: true,
        error: null,
        msg: [],
      };
    } else {
      result = {
        status: false,
        error: 'Failed to get leaderboard',
        msg: [],
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to get leaderboard', msg: [] };
  }

  return result;
};

/**
 * Resets the leaderboard filtered by the Event ID
 *
 * @param eventID Event ID
 * @param session User Session
 * @return a Promise containing a Result
 */
export const resetLeaderBoardByEventID = async (
  eventID: string,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    await log(session.user.email, eventID, 'Reset Leaderboard');

    const board: Leaderboard[] = await prisma.leaderboard.updateMany({
      where: {
        eventID: eventID,
      },
      data: {
        points: 0,
        updated_at: new Date().toISOString(),
      },
    });

    if (board) {
      result = { status: true, error: null, msg: board };
    } else {
      result = {
        status: false,
        error: 'Failed to reset leaderboard',
        msg: [],
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to reset leaderboard', msg: [] };
  }

  return result;
};

/**
 * Deletes the leaderboard filtered by the Event ID
 *
 * @param eventID Event ID
 * @param session User Session
 * @return a Promise containing a Result
 */
export const deleteLeaderBoardByEventID = async (
  eventID: string,
  session: Session,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    await log(session.user.email, eventID, 'Delete Leaderboard');

    const board: Leaderboard = await prisma.leaderboard.deleteMany({
      where: {
        eventID: eventID,
      },
    });

    if (board) {
      result = { status: true, error: null, msg: board };
    } else {
      result = {
        status: false,
        error: 'Failed to delete leaderboard in database',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to delete leaderboard in database',
      msg: null,
    };
  }

  return result;
};

/**
 * Updates the user points
 *
 * @param eventID Event ID
 * @param username Username
 * @param points Number of points to add
 * @return a Promise containing a Result
 */
export const updateUserPoints = async (
  eventID: string,
  username: string,
  points: number,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const doesUser: Result = await doesUserExist(eventID, username);
    if (doesUser.status) {
      const doesUserMsg: Leaderboard = doesUser.msg[0];
      let userPoints: number = 0;
      if (doesUserMsg.points !== undefined) {
        userPoints = doesUserMsg.points;
      }

      const userID = doesUserMsg.id;
      const finalPoints: number = Number(userPoints) + Number(points);

      await log(
        username,
        eventID,
        `Update Points by ${points} to ${finalPoints}`,
      );

      const board: Leaderboard = await prisma.leaderboard.update({
        where: {
          id: userID,
        },
        data: {
          points: Number(finalPoints),
          updated_at: new Date().toISOString(),
        },
      });

      if (board) {
        result = { status: true, error: null, msg: board };
      } else {
        result = {
          status: false,
          error: 'Failed to update leaderboard',
          msg: '',
        };
      }
    } else {
      result = { status: false, error: doesUser.error, msg: null };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to update leaderboard',
      msg: null,
    };
  }

  return result;
};

/**
 * Count the number of users registered under the event
 *
 * @param eventID Event ID
 * @return a Promise containing a Result
 */
export const countUserInEvent = async (eventID: string): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  try {
    const users = await prisma.leaderboard.count({
      where: {
        eventID: eventID,
      },
    });

    result = { status: true, error: null, msg: users };
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to count players in leaderboard',
      msg: 0,
    };
  }

  return result;
};
