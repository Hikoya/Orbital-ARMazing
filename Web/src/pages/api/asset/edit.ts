import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Asset } from 'types/asset';

import { checkerString } from '@helper/common';
import { currentSession } from '@helper/sessionServer';
import { editAsset } from '@helper/asset';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { levels } from '@constants/admin';

import AWS from 'aws-sdk';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API Route to edit an asset
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
          let success = true;

          if (
            imageFile !== null &&
            imageFile !== undefined &&
            process.env.S3_UPLOAD_KEY !== undefined &&
            process.env.S3_UPLOAD_SECRET !== undefined
          ) {
            const s3 = new AWS.S3({
              accessKeyId: process.env.S3_UPLOAD_KEY,
              secretAccessKey: process.env.S3_UPLOAD_SECRET,
            });

            const imagePath: string = imageFile.filepath;
            const image = await fs.readFile(imagePath);

            if (process.env.S3_BUCKET_NAME !== undefined) {
              const uploadedImage = await s3
                .upload({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: `${eventID}_${imageFile.originalFilename}`,
                  Body: image,
                })
                .promise();

              if (uploadedImage.Location) {
                assetData = {
                  id: id.trim(),
                  name: name.trim(),
                  description: description.trim(),
                  eventID: eventID.trim(),
                  visible: visible,
                  latitude: latitude.trim(),
                  longitude: longitude.trim(),
                  imagePath: uploadedImage.Location.trim(),
                  updated_at: new Date().toISOString(),
                };
              } else {
                success = false;
                console.error('Image not uploaded');
                result = {
                  status: false,
                  error: 'Image not uploaded',
                  msg: '',
                };
                res.status(200).send(result);
                res.end();
              }
            } else {
              success = false;
              result = {
                status: false,
                error: 'Error: no key provided for bucket',
                msg: '',
              };
              res.status(200).send(result);
              res.end();
            }
          } else {
            assetData = {
              id: id,
              name: name,
              description: description,
              eventID: eventID,
              visible: visible,
              latitude: latitude,
              longitude: longitude,
            };
          }

          if (success && assetData !== null) {
            const createEventRequest = await editAsset(assetData, session);
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
          }
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
        console.error(error);
        result = { status: false, error: 'Failed to edit asset', msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized request', msg: '' };
      res.status(401).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated request', msg: '' };
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
