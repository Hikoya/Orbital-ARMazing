import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { prettifyDate, convertUnixToDate } from '@constants/helper';
import { currentSession } from '@helper/session';
import { fetchAllEventByUser } from '@helper/event';
import { levels } from '@constants/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      const events = await fetchAllEventByUser(session);
      const parsedEvent: Event[] = [];

      if (events && events.status) {
        const eventData: Event[] = events.msg as Event[];
        for (let ev = 0; ev < eventData.length; ev += 1) {
          if (eventData[ev]) {
            const event: Event = eventData[ev];

            const start = prettifyDate(
              convertUnixToDate(Number(event.startDate)),
            );
            const end = prettifyDate(convertUnixToDate(Number(event.endDate)));

            const isPublic = event.isPublic ? 'Yes' : 'No';
            const visible = event.visible ? 'Yes' : 'No';

            const data: Event = {
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
      } else {
        result = {
          status: false,
          error: 'Cannot get all events',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized request', msg: '' };
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
