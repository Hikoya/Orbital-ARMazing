import { currentSession } from "@helper/session";
import { levels } from "@constants/admin";

const handler = async (req, res) => {
  const session = await currentSession(req);

  const { eventID, question, answer, options, points, visible } = req.body;
  let result = null;

  if (session) {
    if (session.user.level == levels["ORGANIZER"]) {
      if (eventID && question && answer && options && points && visible) {
        const data = {
          eventID: eventID,
          question: question,
          options: options,
          answer: answer,
          points: points,
          visible: visible,
          createdBy: session.user.email,
        };

        const qn = await createQuiz(data);

        if (qn.status) {
          result = {
            status: true,
            error: null,
            msg: "Quiz created",
          };

          res.status(200).send(result);
          res.end();
          return;
        } else {
          result = {
            status: false,
            error: qn.error,
            msg: "",
          };

          res.status(200).send(result);
          res.end();
          return;
        }
      } else {
        result = {
          status: false,
          error: "Information incomplete!",
          msg: null,
        };

        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = {
        status: false,
        error: "Unauthorized access",
        msg: null,
      };

      res.status(200).send(result);
      res.end();
      return;
    }
  }
};

export default handler;
