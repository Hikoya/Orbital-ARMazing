import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Asset } from 'types/asset';

import { checkerString } from '@helper/common';
import { currentSession } from '@helper/session';
import { editAsset } from '@helper/asset';
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
        let assetPath: string = '';
        let assetData: Asset | null = null;

        const id = data.fields.id as string;
        const name = data.fields.name as string;
        const description = data.fields.description as string;
        const eventID = data.fields.eventID as string;
        const visible = data.fields.visible === 'true';
        const latitude = data.fields.latitude as string;
        const longitude = data.fields.longitude as string;

        if (
          checkerString(id) &&
          checkerString(name) &&
          checkerString(description) &&
          checkerString(eventID) &&
          checkerString(latitude) &&
          checkerString(longitude)
        ) {
          if (imageFile) {
            const imagePath: string = imageFile.filepath;

            assetPath = `/assets/${data.fields.eventID}_${imageFile.originalFilename}`;
            const pathToWriteImage = `public${assetPath}`;
            const image = await fs.readFile(imagePath);
            await fs.writeFile(pathToWriteImage, image);

            assetData = {
              id: id.trim(),
              name: name.trim(),
              description: description.trim(),
              eventID: eventID.trim(),
              visible: visible,
              latitude: latitude.trim(),
              longitude: longitude.trim(),
              imagePath: assetPath.trim(),
              createdBy: session.user.email.trim(),
            };
          } else {
            assetData = {
              id: id,
              name: name,
              description: description,
              eventID: eventID,
              visible: visible,
              latitude: latitude,
              longitude: longitude,
              createdBy: session.user.email,
            };
          }

          const createEventRequest = await editAsset(assetData);
          if (createEventRequest.status) {
            result = {
              status: true,
              error: '',
              msg: 'Successfully updated asset',
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
        } else {
          result = {
            status: false,
            error: 'Missing information',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
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
