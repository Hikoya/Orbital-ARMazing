import { prisma } from '@helper/db';

import { Log } from 'types/log';

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
