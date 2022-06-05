import { currentSession } from "@helper/session";
import { joinEvent } from "@helper/event";
import { levels } from "@constants/admin";

const handler = async (req, res) => {
  const session = await currentSession(req);

  const { eventID } = req.body;

  let result = "";
  if (session) {
    if (eventID) {
      const join = await joinEvent(session, eventID, levels["USER"]);
      if (join.status) {
        result = {
          status: true,
          error: null,
          msg: "Successfully joined event",
        };
        res.status(200).send(result);
        res.end();
        return;
      } else {
        result = {
          status: false,
          error: join.error,
          msg: "",
        };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = {
        status: false,
        error: "Cannot get all events",
        msg: "",
      };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Unauthenticated", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
