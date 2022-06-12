import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { EventFetch } from 'types/event';

import { prettifyDate, convertUnixToDate } from '@constants/helper';
import { fetchAllEvent } from '@helper/event';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (req.headers.authorization !== null || req.headers.authorization !== '') {
    const head = req.headers.authorization;
    if (head === process.env.AUTHORIZATION_HEADER) {
      const events = await fetchAllEvent();
      const parsedEvent: EventFetch[] = [];

      if (events && events.status) {
        const eventData: EventFetch[] = events.msg as EventFetch[];
        for (let ev = 0; ev < eventData.length; ev += 1) {
          if (eventData[ev]) {
            const event: EventFetch = eventData[ev];

            const start = prettifyDate(
              convertUnixToDate(Number(event.startDate)),
            );
            const end = prettifyDate(convertUnixToDate(Number(event.endDate)));

            const isPublic = event.isPublic ? 'Yes' : 'No';
            const visible = event.visible ? 'Yes' : 'No';

            const data: EventFetch = {
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
      result = {
        status: false,
        error: 'Unauthorized',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthorized',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
