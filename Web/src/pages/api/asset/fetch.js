import { currentSession } from "@constants/helper";
import { fetchAllAsset } from "@constants/asset";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = "";
  if (session) {
    const assets = await fetchAllAsset(session);
    const parsedAsset = [];

    if (assets && assets.status) {
      const assetData = assets.msg;
      for (let as in assetData) {
        if (assetData[as]) {
          const asset = assetData[as];

          const visible = asset.visible ? "Yes": "No";
          
          const data = {
            id: asset.id,
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
      return;
    } else {
      result = {
        status: false,
        error: "Cannot get all events",
        msg: "",
      };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Unauthenticated", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
