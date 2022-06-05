import { currentSession } from "@helper/session";
import { convertDateToUnix } from "@constants/helper";
import { createEvent, joinEvent } from "@helper/event";
import { levels } from "@constants/admin";

const handler = async (req, res) => {
  const session = await currentSession(req);

  const { name, description, startDate, endDate, isPublic, visible } = req.body;
  let result = null;

  if (session) {
    if (session.user.level == levels["ORGANIZER"]) {
      if (name && description && startDate && endDate && isPublic && visible) {
        const start = convertDateToUnix(startDate);
        const end = convertDateToUnix(endDate);

        const data = {
          name: name,
          description: description,
          startDate: start,
          endDate: end,
          isPublic: isPublic,
          visible: visible,
          createdBy: session.user.email,
        };

        const event = await createEvent(data);

        if (event.status) {
          const eventJoin = await joinEvent(
            session,
            event.msg.id,
            levels["ORGANIZER"]
          );
          if (eventJoin.status) {
            result = {
              status: true,
              error: null,
              msg: "Event created",
            };

            res.status(200).send(result);
            res.end();
            return;
          } else {
            result = {
              status: false,
              error: eventJoin.error,
              msg: "",
            };

            res.status(200).send(result);
            res.end();
            return;
          }
        } else {
          result = {
            status: false,
            error: event.error,
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
