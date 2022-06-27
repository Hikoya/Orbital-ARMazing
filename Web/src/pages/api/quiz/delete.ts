import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { levels } from '@constants/admin';

import { currentSession } from '@helper/sessionServer';
import { deleteQuiz, isCreatorOfQuiz } from '@helper/quiz';
import { checkerString } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  const { quizID } = req.body;

  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (checkerString(quizID)) {
        const isCreator: boolean = await isCreatorOfQuiz(quizID, session);
        if (isCreator) {
          const qn = await deleteQuiz(quizID);
          if (qn.status) {
            result = {
              status: true,
              error: null,
              msg: 'Quiz deleted',
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
            error: 'Only the creator can delete the asset',
            msg: null,
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
