import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { currentSession } from '@helper/sessionServer';
import { fetchStatistic } from '@helper/dashboard';
import { levels } from '@constants/admin';

/**
 * API Route to fetch dashboard statistics
 *
 * @return A Result with status code
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (
      session.user.level === levels.ORGANIZER ||
      session.user.level === levels.FACILITATOR
    ) {
      const stat = await fetchStatistic(session);
      if (stat && stat.status) {
        result = {
          status: true,
          error: null,
          msg: stat.msg,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: stat.error,
          msg: { event: 0, asset: 0, user: 0 },
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Unauthorized',
        msg: { event: 0, asset: 0, user: 0 },
      };
      res.status(401).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Session not found',
      msg: { event: 0, asset: 0, user: 0 },
    };
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
