import { prisma } from '@helper/db';

export const fetchStatistic = async (session) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        createdBy: session.user.email,
      },
    });

    let numberOfUsers = 0;
    let numberOfEvents = 0;
    if (events) {
      for (let ev in events) {
        if (events[ev]) {
          const event = events[ev];
          const id = event.id;

          const users = await prisma.eventsJoined.count({
            where: {
              eventID: id,
            },
          });

          numberOfUsers += users;
          numberOfEvents += 1;
        }
      }
    }

    const numberOfAssets = await prisma.assets.count({
      where: {
        createdBy: session.user.email,
      },
    });

    const result = {
      event: numberOfEvents,
      asset: numberOfAssets,
      user: numberOfUsers,
    };
    return { status: true, error: null, msg: result };
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: null };
  }
};
