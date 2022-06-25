import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Quiz } from 'types/quiz';
import { Event } from 'types/event';
import { Asset } from 'types/asset';

import { fetchAllQuizByEvent } from '@helper/quiz';
import { fetchEventByID } from '@helper/event';
import { fetchAssetByID } from '@helper/asset';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const { eventID } = req.body;

  if (
    req.headers.authorization !== null &&
    req.headers.authorization !== '' &&
    req.headers.authorization !== undefined
  ) {
    const head: string = req.headers.authorization;
    const secret: string = `Bearer ${process.env.AUTHORIZATION_HEADER}`;
    if (head === secret) {
      if (eventID) {
        const qn = await fetchAllQuizByEvent(eventID);
        const parsedQuiz: Quiz[] = [];

        if (qn && qn.status && qn.msg !== null) {
          const questionData: Quiz[] = qn.msg as Quiz[];

          if (questionData && questionData.length > 0) {
            const event = await fetchEventByID(eventID);
            const eventMsg = event.msg as Event;
            const eventName: string = eventMsg.name;

            for (let q = 0; q < questionData.length; q += 1) {
              if (questionData[q]) {
                const quiz: Quiz = questionData[q];
                const { assetID } = quiz;
                if (assetID !== undefined) {
                  const asset = await fetchAssetByID(assetID);
                  const assetMsg = asset.msg as Asset;
                  const assetName: string = assetMsg.name as string;

                  if (quiz.options !== undefined) {
                    const questions: string[] = quiz.options.split(',');
                    const option1 = questions[0];
                    const option2 = questions[1];
                    const option3 = questions[2];
                    const option4 = questions[3];

                    if (event.status) {
                      const data: Quiz = {
                        id: quiz.id,
                        eventName: eventName,
                        asset: assetName,
                        eventID: quiz.eventID,
                        assetID: quiz.assetID,
                        question: quiz.question,
                        option1: option1,
                        option2: option2,
                        option3: option3,
                        option4: option4,
                        answer: quiz.answer,
                        points: quiz.points,
                        visible: quiz.visible,
                      };

                      parsedQuiz.push(data);
                    }
                  }
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
        result = {
          status: false,
          error: 'No EventID given',
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized, invalid token', msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthorized, token not found', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
