import { prisma } from '../lib/prisma';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export interface SessionContext {
  country?: string;
  device?: string;
}

export async function getOrCreateSession(
  siteId: string,
  visitorId: string,
  context: SessionContext = {},
) {
  const now = new Date();

const activeSince = new Date(
    now.getTime() - SESSION_TIMEOUT_MS,
  );

const existingSession =
    await prisma.sessionRecord.findFirst({
      where: {
        siteId,
        visitorId,
        startedAt: {
          gte: activeSince,
          lte: now,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

if (existingSession) {
    return prisma.sessionRecord.update({
      where: {
        id: existingSession.id,
      },
      data: {
        durationSeconds: Math.floor(
          (now.getTime() -
            existingSession.startedAt.getTime()) /
            1000,
        ),
        pageviews: {
          increment: 1,
        },
        country:
          context.country ?? existingSession.country,
        device:
          context.device ?? existingSession.device,
      },
    });
  }

return prisma.sessionRecord.create({
    data: {
      siteId,
      visitorId,
      startedAt: now,
      durationSeconds: 0,
      pageviews: 1,
      country: context.country,
      device: context.device,
    },
  });
}
