import { currentSession, convertDateToUnix } from "@constants/helper";
import { createEvent } from "@constants/event";

const handler = async (req, res) => {
  const session = await currentSession(req);

  const { name, description, startDate, endDate, isPublic, visible } = req.body;
  let result = null;

  console.log(req.body);
  
  if (session) {
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
          error: "Event not created",
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
  }
};

export default handler;
