import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { formatDateToString, convertUnixToDate } from '@constants/date';
import { fetchAllEvent } from '@helper/event';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (
    req.headers.authorization !== null &&
    req.headers.authorization !== '' &&
    req.headers.authorization !== undefined
  ) {
    const head: string = req.headers.authorization;
    const secret: string = `Bearer ${process.env.AUTHORIZATION_HEADER}`;
    if (head === secret) {
      const events = await fetchAllEvent();
      const parsedEvent: Event[] = [];

      if (events && events.status) {
        const eventData: Event[] = events.msg as Event[];
        for (let ev = 0; ev < eventData.length; ev += 1) {
          if (eventData[ev]) {
            const event: Event = eventData[ev];

            const startD: Date | null = convertUnixToDate(
              Number(event.startDate),
            );
            const endD: Date | null = convertUnixToDate(Number(event.endDate));

            if (startD !== null && endD !== null) {
              const start = formatDateToString(startD);
              const end = formatDateToString(endD);

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
              };

              parsedEvent.push(data);
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
      result = { status: false, error: 'Unauthorized, invalid token', msg: [] };
      res.status(401).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthorized, token not found', msg: [] };
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
