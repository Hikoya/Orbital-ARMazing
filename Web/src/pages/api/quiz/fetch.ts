import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Quiz } from 'types/quiz';

import { currentSession } from '@helper/sessionServer';
import { fetchAllQuiz } from '@helper/quiz';
import { fetchEventByID } from '@helper/event';
import { Event } from 'types/event';
import { levels } from '@constants/admin';

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
      const qn = await fetchAllQuiz(session);
      const parsedQuiz: Quiz[] = [];

      if (qn.status) {
        if (qn.msg !== null) {
          const questionData: Quiz[] = qn.msg as Quiz[];
          for (let q = 0; q < questionData.length; q += 1) {
            if (questionData[q]) {
              const quiz: Quiz = questionData[q];

              const visible = quiz.visible ? 'Yes' : 'No';
              const event = await fetchEventByID(quiz.eventID);
              const eventMsg = event.msg as Event;
              const eventName: string = eventMsg.name;

              if (event.status) {
                const data: Quiz = {
                  id: quiz.id,
                  event: eventName,
                  assetID: quiz.assetID,
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
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: true, error: null, msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Session not found', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
