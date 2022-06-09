import { currentSession } from '@helper/session';
import { levels } from '@constants/admin';
import { createQuiz } from '@helper/quiz';

const handler = async (req, res) => {
  const session = await currentSession(req);

  const {
    eventID,
    question,
    option1,
    option2,
    option3,
    option4,
    answer,
    points,
    visible,
  } = req.body;

  console.log(req.body);

  let result = null;
  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (eventID && question && answer && points && visible) {
        const options = [option1, option2, option3, option4].toString();
        const data = {
          eventID: eventID,
          question: question,
          options: options,
          answer: Number(answer),
          points: Number(points),
          visible: visible,
          createdBy: session.user.email,
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

      res.status(200).send(result);
      res.end();
    }
  }
};

export default handler;
