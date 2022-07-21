import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { joinEvent } from '@helper/leaderboard';
import { fetchEventByCode } from '@helper/event';

/**
 * API Route to allow players to join an Event through event code
 *
 * This API route is only for the Unity Application
 * Authentication is exchanged through an Authorization Header code shared
 * between the two applications.
 *
 * @return A Result with status code
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (req.method === 'POST') {
    const { eventID, username } = req.body;

    if (
      req.headers.authorization !== null &&
      req.headers.authorization !== '' &&
      req.headers.authorization !== undefined
    ) {
      const head: string = req.headers.authorization;
      const secret: string = `Bearer ${process.env.AUTHORIZATION_HEADER}`;
      if (head === secret) {
        if (eventID && username) {
          const join: Result = await joinEvent(eventID, username);
          if (join.status) {
            const doesEventRes: Result = await fetchEventByCode(eventID);
            if (doesEventRes.status && doesEventRes.msg !== null) {
              const doesEvent: Event = doesEventRes.msg;
              if (doesEvent.id !== undefined) {
                result = {
                  status: true,
                  error: null,
                  msg: { eventID: doesEvent.id, eventName: doesEvent.name },
                };
                res.status(202).send(result);
                res.end();
              }
            } else {
              result = {
                status: false,
                error: doesEventRes.error,
                msg: '',
              };
              res.status(202).send(result);
              res.end();
            }
          } else {
            result = {
              status: false,
              error: join.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'Cannot join event',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Unauthorized, invalid token',
          msg: [],
        };
        res.status(401).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Unauthorized, token not found',
        msg: [],
      };
      res.status(401).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'HTTP Post only',
      msg: '',
    };
    res.status(403).send(result);
    res.end();
  }
};

export default handler;
