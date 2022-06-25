import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { joinEvent } from '@helper/leaderboard';

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
            result = {
              status: true,
              error: null,
              msg: 'Successfully joined event',
            };
            res.status(202).send(result);
            res.end();
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
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Unauthorized, token not found',
        msg: [],
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'HTTP Post only',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
