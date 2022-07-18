import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { formatDateToString, convertUnixToDate } from '@constants/date';
import { currentSession } from '@helper/sessionServer';
import { fetchAllEventByUser } from '@helper/event';
import { levels } from '@constants/admin';

/**
 * API Route to fetch all events by user session
 *
 * @return A Result with status code
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session !== null && session !== undefined) {
    if (
      session.user.level === levels.ORGANIZER ||
      session.user.level === levels.FACILITATOR
    ) {
      const events: Result = await fetchAllEventByUser(session);
      const parsedEvent: Event[] = [];

      if (events.status) {
        if (events.msg !== null) {
          const eventData: Event[] = events.msg as Event[];
          for (let ev = 0; ev < eventData.length; ev += 1) {
            if (eventData[ev]) {
              const event: Event = eventData[ev];

              const startD: Date | null = convertUnixToDate(
                Number(event.startDate),
              );
              const endD: Date | null = convertUnixToDate(
                Number(event.endDate),
              );

              if (startD !== null && endD !== null) {
                const end = formatDateToString(endD);
                const start = formatDateToString(startD);

                const isPublic = event.isPublic ? 'Yes' : 'No';
                const visible = event.visible ? 'Yes' : 'No';

                const data: Event = {
                  id: event.id,
                  name: event.name,
                  description: event.description,
                  startDate: event.startDate,
                  endDate: event.endDate,
                  startDateStr: start,
                  endDateStr: end,
                  isPublic: event.isPublic,
                  visible: event.visible,
                  isPublicText: isPublic,
                  visibleText: visible,
                  eventCode: event.eventCode,
                };

                parsedEvent.push(data);
              }
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedEvent,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: 'Cannot get all events',
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
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
