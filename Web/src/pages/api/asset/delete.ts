import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { currentSession } from '@helper/sessionServer';
import { deleteAsset, isCreatorOfAsset } from '@helper/asset';
import { levels } from '@constants/admin';
import { checkerString } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);

  const { id } = req.body;
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      if (checkerString(id)) {
        const isCreator: boolean = await isCreatorOfAsset(id, session);
        if (isCreator) {
          const asset: Result = await deleteAsset(id);
          if (asset.status) {
            result = {
              status: true,
              error: null,
              msg: 'Asset deleted',
            };

            res.status(200).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: asset.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'Only the creator can delete the asset',
            msg: null,
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
      error: 'Unauthorized access',
      msg: null,
    };

    res.status(200).send(result);
    res.end();
  }
};

export default handler;
