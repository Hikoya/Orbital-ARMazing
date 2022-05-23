import { currentSession } from "@constants/helper";
import { fetchAllEvent } from "@constants/event";

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

          const data = {
            id: event.id,
            name: event.name,
            description: event.description,
            startDate: event.start,
            endDate: event.end,
            isPublic: event.isPublic,
            visible: event.visible,
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
