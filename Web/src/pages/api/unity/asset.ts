import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Asset } from 'types/asset';

import { fetchAllAsset } from '@helper/asset';

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
      const assets = await fetchAllAsset();
      const parsedAsset: Asset[] = [];

      let url: string = 'https://orbital-armazing.herokuapp.com';
      if (process.env.NEXTAUTH_URL !== undefined) {
        url = process.env.NEXTAUTH_URL;
      }

      if (assets && assets.status) {
        const assetData: Asset[] = assets.msg;
        for (let as = 0; as < assetData.length; as += 1) {
          if (assetData[as]) {
            const asset: Asset = assetData[as];

            const visible = asset.visible ? 'Yes' : 'No';

            const data: Asset = {
              id: asset.id,
              eventID: asset.eventID,
              name: asset.name,
              description: asset.description,
              latitude: asset.latitude,
              longitude: asset.longitude,
              visible: asset.visible,
              visibleText: visible,
              imagePath: `${url}${asset.imagePath}`,
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
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized, invalid token', msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthorized, token not found', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
