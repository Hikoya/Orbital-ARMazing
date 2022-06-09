import { currentSession } from '@helper/session';
import { fetchAllQuiz } from '@helper/quiz';
import { fetchEventByID } from '@helper/event';

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = '';
  if (session) {
    const qn = await fetchAllQuiz(session);
    const parsedQuiz = [];

    if (qn && qn.status) {
      const questionData = qn.msg;
      for (const q in questionData) {
        if (questionData[q]) {
          const quiz = questionData[q];

          const visible = quiz.visible ? 'Yes' : 'No';
          const event = await fetchEventByID(quiz.eventID);

          if (event.status) {
            const data = {
              id: quiz.id,
              event: event.msg.name,
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
};

export default handler;
