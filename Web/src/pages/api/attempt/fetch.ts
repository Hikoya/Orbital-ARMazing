import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Attempt } from 'types/attempt';
import { Asset } from 'types/asset';

import { currentSession } from '@helper/sessionServer';
import { fetchEventByID, isEventAuthorized } from '@helper/event';
import { levels } from '@constants/admin';
import { checkerString } from '@helper/common';
import { fetchAttemptByEventID } from '@helper/attempt';
import { fetchAssetByID } from '@helper/asset';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  const { eventID, username } = req.body;

  if (session) {
    if (
      session.user.level === levels.ORGANIZER ||
      session.user.level === levels.FACILITATOR
    ) {
      if (checkerString(eventID) && checkerString(username)) {
        const parsedAttempts: Attempt[] = [];

        const event = await fetchEventByID(eventID);
        if (event.status) {
          const eventMsg: Event = event.msg as Event;
          const isAuthorized: boolean = await isEventAuthorized(
            eventMsg,
            session,
          );
          if (isAuthorized) {
            const board: Result = await fetchAttemptByEventID(
              eventID,
              username,
            );
            if (board.status) {
              const attempts: Attempt[] = board.msg;
              for (let key = 0; key < attempts.length; key += 1) {
                if (attempts[key]) {
                  const att: Attempt = attempts[key];

                  const assetRes: Result = await fetchAssetByID(att.assetID);
                  if (assetRes.status) {
                    const asset: Asset = assetRes.msg;

                    const data: Attempt = {
                      eventID: eventID,
                      username: username,
                      assetID: att.assetID,
                      assetName: asset.name,
                    };

                    parsedAttempts.push(data);
                  }
                }
              }

              result = {
                status: true,
                error: null,
                msg: parsedAttempts,
              };
              res.status(200).send(result);
              res.end();
            } else {
              result = {
                status: false,
                error: board.error,
                msg: [],
              };
              res.status(200).send(result);
              res.end();
            }
          } else {
            result = {
              status: false,
              error: 'Not authorized',
              msg: [],
            };
            res.status(401).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'No event found',
            msg: [],
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'No event ID provided',
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
