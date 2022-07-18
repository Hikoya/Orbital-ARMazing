import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Asset } from 'types/asset';
import { Event } from 'types/event';

import { currentSession } from '@helper/sessionServer';
import { fetchAllAssetByUser } from '@helper/asset';
import { fetchEventByID } from '@helper/event';

import { levels } from '@constants/admin';

/**
 * API Route to fetch all assets
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

  if (session) {
    if (
      session.user.level === levels.ORGANIZER ||
      session.user.level === levels.FACILITATOR
    ) {
      const assets = await fetchAllAssetByUser(session);
      const parsedAsset: Asset[] = [];

      if (assets.status) {
        if (assets.msg !== null) {
          const assetData: Asset[] = assets.msg;
          for (let as = 0; as < assetData.length; as += 1) {
            if (assetData[as]) {
              const asset: Asset = assetData[as];

              const visible = asset.visible ? 'Yes' : 'No';
              const eventRes: Result = await fetchEventByID(asset.eventID);
              if (eventRes.status) {
                const event: Event = eventRes.msg;

                const data: Asset = {
                  id: asset.id,
                  eventName: event.name,
                  eventID: asset.eventID,
                  name: asset.name,
                  description: asset.description,
                  latitude: asset.latitude,
                  longitude: asset.longitude,
                  imagePath: asset.imagePath,
                  visible: asset.visible,
                  visibleText: visible,
                };

                parsedAsset.push(data);
              }
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedAsset,
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
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
