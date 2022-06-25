import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';

import { currentSession } from '@helper/sessionServer';
import { convertDateToUnix } from '@constants/date';
import { createEvent } from '@helper/event';
import { levels } from '@constants/admin';
import { checkerString } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  const { name, description, startDate, endDate, isPublic, visible } = req.body;
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (
        checkerString(name) &&
        checkerString(description) &&
        checkerString(startDate) &&
        checkerString(endDate)
      ) {
        const start = convertDateToUnix(startDate);
        const end = convertDateToUnix(endDate);

        const data: Event = {
          name: name.trim(),
          description: description.trim(),
          startDate: start,
          endDate: end,
          isPublic: isPublic,
          visible: visible,
          createdBy: session.user.email.trim(),
        };

        const event = await createEvent(data);
        if (event.status) {
          result = {
            status: true,
            error: null,
            msg: 'Event created',
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
  } else {
    result = {
      status: false,
      error: 'Session not found',
      msg: null,
    };

    res.status(200).send(result);
    res.end();
  }
};

export default handler;
