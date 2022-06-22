import { Session } from 'next-auth/core/types';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Statistic } from 'types/dashboard';

import { countUserInEvent } from '@helper/leaderboard';
import { countAsset } from '@helper/asset';
import { fetchAllEventByUser } from '@helper/event';

export const fetchStatistic = async (session: Session): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  let numberOfAssets = 0;
  let numberOfEvents = 0;
  let numberOfUsers = 0;

  try {
    const eventsObj = await fetchAllEventByUser(session);
    if (eventsObj.status) {
      const events: Event[] = eventsObj.msg;
      if (events !== null) {
        for (let ev in events) {
          if (events[ev]) {
            const event: Event = events[ev];
            const id = event.id;

            const countUsers: Result = await countUserInEvent(id);
            if (countUsers.status) {
              const users = countUsers.msg;
              numberOfUsers += users;
              numberOfEvents += 1;
            }

            const countAssets: Result = await countAsset(id);
            if (countAssets.status) {
              numberOfAssets += countAssets.msg;
            }
          }
        }
      }
    }

    const resultMsg: Statistic = {
      event: numberOfEvents,
      asset: numberOfAssets,
      user: numberOfUsers,
    };

    result = { status: true, error: '', msg: resultMsg };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: null };
  }

  return result;
};
