import { Session } from 'next-auth/core/types';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Statistic } from 'types/dashboard';

import { countUserInEvent } from '@helper/leaderboard';
import { countAsset } from '@helper/asset';
import { countQuiz } from '@helper/quiz';
import { fetchAllEventByUser } from '@helper/event';

/**
 * Fetches all statistics
 *
 * The list of statistics are:
 * 1. Number of Events associated with the user
 * 2. Number of Assets associated with the user
 * 3. Number of Quizzes associated with 2.
 * 4. Number of Users that have joined the Events in 1.
 *
 * @param session User Session
 * @return a Promise containing a Result
 */
export const fetchStatistic = async (session: Session): Promise<Result> => {
  let result: Result = {
    status: false,
    error: '',
    msg: '',
  };

  let numberOfAssets = 0;
  let numberOfEvents = 0;
  let numberOfUsers = 0;
  let numberOfQuiz = 0;

  try {
    const eventsObj = await fetchAllEventByUser(session);
    if (eventsObj.status) {
      const events: Event[] = eventsObj.msg;
      if (events !== null) {
        for (let ev in events) {
          if (events[ev]) {
            const event: Event = events[ev];
            const id = event.id;

            if (id !== undefined) {
              const countUsers: Result = await countUserInEvent(id);
              if (countUsers.status) {
                const users = countUsers.msg;
                numberOfUsers += users;
                numberOfEvents += 1;
              }

              const countAssets: Result = await countAsset(id);
              if (countAssets.status) {
                numberOfAssets += countAssets.msg;

                const countQuizs: Result = await countQuiz(id);
                if (countQuizs.status) {
                  numberOfQuiz += countQuizs.msg;
                }
              }
            }
          }
        }
      }
    }

    const resultMsg: Statistic = {
      event: numberOfEvents,
      asset: numberOfAssets,
      user: numberOfUsers,
      quiz: numberOfQuiz,
    };

    result = { status: true, error: '', msg: resultMsg };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to get statistics', msg: null };
  }

  return result;
};
