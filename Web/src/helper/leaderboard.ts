import { prisma } from '@helper/db';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Leaderboard } from 'types/leaderboard';
import { fetchEventByID } from '@helper/event';

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
    console.log(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};

export const joinEvent = async (
  eventID: string,
  user: string,
): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const doesUser: Result = await doesUserExist(eventID, user);
  if (doesUser.status) {
    result = { status: false, error: doesUser.error, msg: null };
  } else {
    try {
      const event: Leaderboard = await prisma.leaderboard.create({
        data: {
          username: user,
          eventID: eventID,
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
      console.log(error);
      result = { status: false, error: error, msg: null };
    }
  }

  return result;
};

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

    if (board.length > 0) {
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
    } else {
      result = {
        status: false,
        error: 'Failed to get leaderboard',
        msg: '',
      };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

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
      const userPoints: number = doesUserMsg.points;
      const userID = doesUserMsg.id;
      const finalPoints: number = Number(userPoints) + Number(points);

      const board: Leaderboard = await prisma.leaderboard.update({
        where: {
          id: userID,
        },
        data: {
          points: Number(finalPoints),
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
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};

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
    console.log(error);
    result = { status: false, error: error.toString(), msg: null };
  }

  return result;
};
