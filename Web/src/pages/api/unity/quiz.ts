import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { QuizFetch } from 'types/quiz';

import { fetchAllQuizByEvent } from '@helper/quiz';
import { fetchEventByID } from '@helper/event';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const { eventID } = req.body;

  if (req.headers.authorization !== null || req.headers.authorization !== '') {
    const head = req.headers.authorization;
    if (head === process.env.AUTHORIZATION_HEADER) {
      const qn = await fetchAllQuizByEvent(eventID);
      const parsedQuiz: QuizFetch[] = [];

      if (qn && qn.status) {
        const event = await fetchEventByID(eventID);
        const eventName: string = event.msg.name;

        const questionData: QuizFetch[] = qn.msg;
        for (let q = 0; q < questionData.length; q += 1) {
          if (questionData[q]) {
            const quiz: QuizFetch = questionData[q];

            const visible = quiz.visible ? 'Yes' : 'No';

            if (event.status) {
              const data: QuizFetch = {
                id: quiz.id,
                event: eventName,
                eventID: quiz.eventID,
                question: quiz.question,
                options: quiz.options,
                answer: quiz.answer,
                points: quiz.points,
                visible: quiz.visible,
                isVisible: visible,
              };

              parsedQuiz.push(data);
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedQuiz,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: 'Cannot get all quiz',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthenticated', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
