import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Leaderboard } from 'types/leaderboard';

import { currentSession } from '@helper/session';
import { fetchEventByID, isEventAuthorized } from '@helper/event';
import { fetchLeaderBoardByEventID } from '@helper/leaderboard';
import { levels } from '@constants/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const { eventID } = req.body;

  if (session) {
    if (
      session.user.level === levels.ORGANIZER ||
      session.user.level === levels.FACILITATOR
    ) {
      if (eventID) {
        const event = await fetchEventByID(eventID);
        if (event.status) {
          const eventMsg = event.msg as Event;
          const isAuthorized = await isEventAuthorized(eventMsg, session);
          if (isAuthorized) {
            const board: Result = await fetchLeaderBoardByEventID(eventID);
            if (board.status) {
              const leaderboard: Leaderboard[] = board.msg;
              result = {
                status: true,
                error: null,
                msg: leaderboard,
              };
              res.status(200).send(result);
              res.end();
            } else {
              result = {
                status: false,
                error: board.error,
                msg: [],
              };
              res.status(200).send(result);
              res.end();
            }
          } else {
            result = {
              status: false,
              error: 'Not authorized',
              msg: [],
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'No event found',
            msg: [],
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'No event ID provided',
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized request', msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
