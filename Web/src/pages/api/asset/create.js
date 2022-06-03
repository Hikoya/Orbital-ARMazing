import { currentSession } from "@helper/session";
import { createAsset } from "@helper/asset";
import { IncomingForm } from "formidable";
import { promises as fs } from "fs";

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const session = await currentSession(req);
  let result = null;

  if (session) {
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    try {
      const imageFile = data.files.image;
      let assetPath = null;

      if (imageFile) {
        const imagePath = imageFile.filepath;

        assetPath =
          "/assets/" + data.fields.eventID + "_" + imageFile.originalFilename;
        const pathToWriteImage = "public" + assetPath;
        const image = await fs.readFile(imagePath);
        await fs.writeFile(pathToWriteImage, image);
      }

      const assetData = {
        name: data.fields.name,
        description: data.fields.description,
        eventID: data.fields.eventID,
        visible: data.fields.visible === "true",
        latitude: data.fields.latitude,
        longitude: data.fields.longitude,
        imagePath: assetPath,
        createdBy: session.user.email,
      };

      const createEventRequest = await createAsset(assetData);
      if (createEventRequest.status) {
        result = {
          status: true,
          error: "",
          msg: "Successfully created asset",
        };
        res.status(200).send(result);
        res.end();
        return;
      } else {
        result = {
          status: false,
          error: createEventRequest.error,
          msg: "",
        };
        res.status(200).send(result);
        res.end();
        return;
      }
    } catch (error) {
      console.log(error);
      result = { status: false, error: "Failed to create asset", msg: "" };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Unauthenticated request", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
