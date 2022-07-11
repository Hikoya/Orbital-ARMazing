import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { updateUserPoints } from '@helper/leaderboard';
import { log } from '@helper/log';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (req.method === 'POST') {
    const { eventID, username, points, quizID } = req.body;

    if (
      req.headers.authorization !== null &&
      req.headers.authorization !== '' &&
      req.headers.authorization !== undefined
    ) {
      const head: string = req.headers.authorization;
      const secret: string = `Bearer ${process.env.AUTHORIZATION_HEADER}`;
      if (head === secret) {
        if (eventID && username && points) {
          if (quizID) {
            await log(username, eventID, `Attempted Quiz ${quizID}`);
          }

          const updateBoard: Result = await updateUserPoints(
            eventID,
            username,
            points,
          );
          if (updateBoard.status) {
            result = {
              status: true,
              error: 'Successfully updated points',
              msg: '',
            };
            res.status(202).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: updateBoard.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'Missing information',
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
    result = { status: false, error: 'HTTP post only', msg: '' };
    res.status(403).send(result);
    res.end();
  }
};

export default handler;
