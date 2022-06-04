import { currentSession } from "@helper/session";
import { fetchStatistic } from "@helper/dashboard";
import { levels } from "@constants/admin";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = "";
  if (session) {
    if (session.user.level == levels["ORGANIZER"]) {
      const stat = await fetchStatistic(session);

      if (stat && stat.status) {
        result = {
          status: true,
          error: null,
          msg: stat.msg,
        };
        res.status(200).send(result);
        res.end();
        return;
      } else {
        result = {
          status: false,
          error: stat.error,
          msg: "",
        };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = {
        status: false,
        error: "Unauthorized",
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
