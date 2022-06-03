import {
  currentSession,
  prettifyDate,
  convertUnixToDate,
} from "@helper/session";
import { fetchAllEvent } from "@helper/event";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = "";
  if (session) {
    const events = await fetchAllEvent(session);
    const parsedEvent = [];

    if (events && events.status) {
      const eventData = events.msg;
      for (let ev in eventData) {
        if (eventData[ev]) {
          const event = eventData[ev];

          const start = prettifyDate(convertUnixToDate(event.startDate));
          const end = prettifyDate(convertUnixToDate(event.endDate));

          const isPublic = event.isPublic ? "Yes" : "No";
          const visible = event.visible ? "Yes" : "No";

          const data = {
            id: event.id,
            name: event.name,
            description: event.description,
            startDate: start,
            endDate: end,
            isPublic: event.isPublic,
            visible: event.visible,
            isPublicText: isPublic,
            visibleText: visible,
          };

          parsedEvent.push(data);
        }
      }

      result = {
        status: true,
        error: null,
        msg: parsedEvent,
      };
      res.status(200).send(result);
      res.end();
      return;
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
