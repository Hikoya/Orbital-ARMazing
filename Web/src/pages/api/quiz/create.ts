import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Quiz } from 'types/quiz';

import { levels } from '@constants/admin';

import { currentSession } from '@helper/sessionServer';
import { createQuiz } from '@helper/quiz';
import { checkerNumber, checkerString } from '@helper/common';

/**
 * API Route to create a Quiz
 *
 * @return A Result with status code
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  const {
    eventID,
    assetID,
    question,
    option1,
    option2,
    option3,
    option4,
    answer,
    points,
    visible,
  } = req.body;

  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (
        checkerString(eventID) &&
        checkerString(question) &&
        checkerNumber(answer) &&
        answer !== 0 &&
        checkerNumber(points) &&
        points !== 0 &&
        checkerString(option1) &&
        checkerString(option2) &&
        checkerString(option3) &&
        checkerString(option4)
      ) {
        const options = [option1, option2, option3, option4].toString();
        const data: Quiz = {
          eventID: eventID.trim(),
          assetID: assetID.trim(),
          question: question.trim(),
          options: options.trim(),
          answer: Number(answer),
          points: Number(points),
          visible: visible,
          createdBy: session.user.email.trim(),
        };

        const qn = await createQuiz(data);

        if (qn.status) {
          result = {
            status: true,
            error: null,
            msg: 'Quiz created',
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
