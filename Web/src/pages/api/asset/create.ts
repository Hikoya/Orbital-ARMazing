import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Asset } from 'types/asset';

import { currentSession } from '@helper/session';
import { createAsset } from '@helper/asset';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { levels } from '@constants/admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.level === levels.ORGANIZER) {
      const data: { fields: formidable.Fields; files: formidable.Files } =
        await new Promise((resolve, reject) => {
          const form = new IncomingForm();
          form.parse(req, (err, fields, files) => {
            if (err) {
              return reject(err);
            }
            resolve({ fields, files });
            return true;
          });
        });

      try {
        const imageFile: formidable.File = data.files.image as formidable.File;
        let assetPath: string = null;

        if (imageFile) {
          const imagePath: string = imageFile.filepath;

          assetPath = `/assets/${data.fields.eventID}_${imageFile.originalFilename}`;
          const pathToWriteImage = `public${assetPath}`;
          const image = await fs.readFile(imagePath);
          await fs.writeFile(pathToWriteImage, image);
        }

        const assetData: Asset = {
          name: data.fields.name,
          description: data.fields.description,
          eventID: data.fields.eventID,
          visible: data.fields.visible === 'true',
          latitude: data.fields.latitude,
          longitude: data.fields.longitude,
          imagePath: assetPath,
          createdBy: session.user.email,
        };

        const createEventRequest = await createAsset(assetData);
        if (createEventRequest.status) {
          result = {
            status: true,
            error: '',
            msg: 'Successfully created asset',
          };
          res.status(200).send(result);
          res.end();
          return;
        }
        result = {
          status: false,
          error: createEventRequest.error,
          msg: '',
        };
        res.status(200).send(result);
        res.end();
        return;
      } catch (error) {
        console.log(error);
        result = { status: false, error: 'Failed to create asset', msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized request', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated request', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
