import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Quiz } from 'types/quiz';

import { levels } from '@constants/admin';

import { currentSession } from '@helper/sessionServer';
import { editQuiz } from '@helper/quiz';
import { checkerNumber, checkerString } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  const {
    quizID,
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
        checkerString(quizID) &&
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
          id: quizID,
          eventID: eventID.trim(),
          assetID: assetID.trim(),
          question: question.trim(),
          options: options.trim(),
          answer: Number(answer),
          points: Number(points),
          visible: visible,
          updated_at: new Date().toISOString(),
        };

        const qn = await editQuiz(data);

        if (qn.status) {
          result = {
            status: true,
            error: null,
            msg: 'Quiz updated',
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
