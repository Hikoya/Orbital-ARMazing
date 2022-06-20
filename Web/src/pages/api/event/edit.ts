import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { currentSession } from '@helper/session';
import { convertDateToUnix } from '@constants/date';
import { editEvent } from '@helper/event';
import { levels } from '@constants/admin';
import { checkerString } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  const { id, name, description, startDate, endDate, isPublic, visible } =
    req.body;
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (
        checkerString(id) &&
        checkerString(name) &&
        checkerString(description) &&
        checkerString(startDate) &&
        checkerString(endDate)
      ) {
        const start = convertDateToUnix(startDate);
        const end = convertDateToUnix(endDate);

        const data: Event = {
          id: id,
          name: name,
          description: description,
          startDate: start,
          endDate: end,
          isPublic: isPublic,
          visible: visible,
          createdBy: session.user.email,
        };

        const event = await editEvent(data);
        if (event.status) {
          result = {
            status: true,
            error: null,
            msg: 'Event updated',
          };

          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: event.error,
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Information incomplete!',
          msg: null,
        };

        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Unauthorized access',
        msg: null,
      };

      res.status(200).send(result);
      res.end();
    }
  }
};

export default handler;
