import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { currentSession } from '@helper/sessionServer';
import { checkerString } from '@helper/common';
import { fetchUserByEmail, updateUserLevel } from '@helper/user';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  const { email, level } = req.body;

  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.admin) {
      if (checkerString(email)) {
        const userRes: Result = await fetchUserByEmail(email);
        if (userRes.status) {
          const qn: Result = await updateUserLevel(email, level);
          if (qn.status) {
            result = {
              status: true,
              error: null,
              msg: 'Level updated',
            };

            res.status(200).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: qn.error,
              msg: '',
            };

            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: userRes.error,
            msg: '',
          };

          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Information incomplete!',
          msg: null,
        };

        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Unauthorized access',
        msg: null,
      };

      res.status(401).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Session not found',
      msg: null,
    };

    res.status(401).send(result);
    res.end();
  }
};

export default handler;
