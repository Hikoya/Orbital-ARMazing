import { prisma } from '@helper/db';

import { Log } from 'types/log';

/**
 * Adds a logging entry in the database
 *
 * @param username Username of the user performing the action.
 * This can either be the Unity application itself, or any user using the web dashboard
 * @param trackingID Tracking ID, this can either be an event ID, asset ID or quiz ID etc.
 * @param content What action was performed
 * @return a Promise containing a Result
 */
export const log = async (
  username: string,
  trackingID: string,
  content: string,
): Promise<void> => {
  try {
    const data: Log = {
      trackingID: trackingID,
      username: username,
      content: content,
    };

    await prisma.log.create({
      data: data,
    });
  } catch (error) {
    console.error(error);
  }
};
