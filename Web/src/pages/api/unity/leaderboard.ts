import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Leaderboard } from 'types/leaderboard';
import { fetchLeaderBoardByEventID } from '@helper/leaderboard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const { eventID } = req.body;

  if (req.headers.authorization !== null || req.headers.authorization !== '') {
    const head: string = req.headers.authorization;
    const secret: string = 'Bearer ' + process.env.AUTHORIZATION_HEADER;
    if (head === secret) {
      if (eventID) {
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
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'No event ID',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthorized', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
