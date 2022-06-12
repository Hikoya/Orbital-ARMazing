import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { AssetFetch } from 'types/asset';

import { fetchAllAsset } from '@helper/asset';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (req.headers.authorization !== null || req.headers.authorization !== '') {
    const head = req.headers.authorization;
    if (head === process.env.AUTHORIZATION_HEADER) {
      const assets = await fetchAllAsset();
      const parsedAsset: AssetFetch[] = [];

      if (assets && assets.status) {
        const assetData: AssetFetch[] = assets.msg;
        for (let as = 0; as < assetData.length; as += 1) {
          if (assetData[as]) {
            const asset: AssetFetch = assetData[as];

            const visible = asset.visible ? 'Yes' : 'No';

            const data: AssetFetch = {
              id: asset.id,
              eventID: asset.eventID,
              name: asset.name,
              description: asset.description,
              latitude: asset.latitude,
              longitude: asset.longitude,
              visible: asset.visible,
              visibleText: visible,
            };

            parsedAsset.push(data);
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
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthenticated', msg: '' };
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
