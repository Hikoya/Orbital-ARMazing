import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { User } from 'types/user';

import { currentSession } from '@helper/sessionServer';
import { fetchAllUser } from '@helper/user';
import { fetchLevel } from '@helper/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null, true);
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  if (session) {
    if (session.user.admin) {
      const us = await fetchAllUser();
      const parsedUser: User[] = [];

      if (us.status) {
        if (us.msg !== null) {
          const userData: User[] = us.msg as User[];
          for (let q = 0; q < userData.length; q += 1) {
            if (userData[q]) {
              const user: User = userData[q];

              const adminStr: string = user.admin ? 'Yes' : 'No';
              const levelStr: string = await fetchLevel(user.level);

              const parsedData: User = {
                email: user.email,
                admin: user.admin,
                adminStr: adminStr,
                level: user.level,
                levelStr: levelStr,
              };

              parsedUser.push(parsedData);
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedUser,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: 'Cannot get all user',
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
    result = { status: false, error: 'Session not found', msg: [] };
    res.status(401).send(result);
    res.end();
  }
};

export default handler;
