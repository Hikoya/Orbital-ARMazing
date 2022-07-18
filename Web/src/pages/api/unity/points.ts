import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Attempt } from 'types/attempt';

import { updateUserPoints } from '@helper/leaderboard';
import { log } from '@helper/log';
import { createAttempt, doesUserAttempt } from '@helper/attempt';

/**
 * API Route to update the user points
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
    const { eventID, username, points, assetID } = req.body;

    if (
      req.headers.authorization !== null &&
      req.headers.authorization !== '' &&
      req.headers.authorization !== undefined
    ) {
      const head: string = req.headers.authorization;
      const secret: string = `Bearer ${process.env.AUTHORIZATION_HEADER}`;
      if (head === secret) {
        let success = true;

        if (eventID && username && points && assetID) {
          await log(username, eventID, `Attempted Quiz from ${assetID}`);

          const isAttempt: boolean = await doesUserAttempt(
            eventID,
            username,
            assetID,
          );
          if (isAttempt) {
            result = {
              status: false,
              error: 'User already attempted this quiz',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          } else {
            const attemptData: Attempt = {
              eventID: eventID,
              username: username,
              assetID: assetID,
              points: points,
            };

            const attemptRes: Result = await createAttempt(attemptData);
            if (!attemptRes.status) {
              success = false;
              result = {
                status: false,
                error: attemptRes.error,
                msg: '',
              };
              res.status(200).send(result);
              res.end();
            }

            if (success) {
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
            }
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
