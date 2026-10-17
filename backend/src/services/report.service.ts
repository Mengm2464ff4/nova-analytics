import { prisma } from '../lib/prisma';

export interface ReportFilters {
  siteId: string;
  from: Date;
  to: Date;
  path?: string;
  country?: string;
}

function eventWhere(filters: ReportFilters) {
  const { siteId, from, to, path, country } = filters;

  return {
    siteId,
    createdAt: {
      gte: from,
      lte: to,
    },
    ...(path ? { path } : {}),
    ...(country ? { country } : {}),
  };
}

function sessionWhere(filters: ReportFilters) {
  const { siteId, from, to, country } = filters;

  return {
    siteId,
    startedAt: {
      gte: from,
      lte: to,
    },
    ...(country ? { country } : {}),
  };
}

export async function getOverview(filters: ReportFilters) {
  const eventsWhere = eventWhere(filters);
  const pageviewWhere = {
    ...eventsWhere,
    type: 'pageview',
  };
  const sessionsWhere = sessionWhere(filters);

  const [
    pageviews,
    uniqueVisitors,
    sessions,
    durationResult,
    bounceCount,
  ] = await Promise.all([
    prisma.event.count({
      where: pageviewWhere,
    }),

    prisma.event
      .findMany({
        where: {
          ...eventsWhere,
          visitorId: { not: null },
        },
        select: { visitorId: true },
        distinct: ['visitorId'],
      })
      .then((rows) => rows.length),

    prisma.sessionRecord.count({
      where: sessionsWhere,
    }),

    prisma.sessionRecord.aggregate({
      where: sessionsWhere,
      _avg: { durationSeconds: true },
    }),

    // Bounces = sessions with exactly 1 pageview
    prisma.sessionRecord.count({
      where: {
        ...sessionsWhere,
        pageviews: 1,
      },
    }),
  ]);

  const bounces = bounceCount;

  return {
    pageviews,
    uniqueVisitors,
    sessions,
    bounces,
    bounceRate:
      sessions > 0 ? (bounces / sessions) * 100 : 0,
    avgSessionDuration:
      durationResult._avg.durationSeconds ?? 0,
  };
}

export async function getTopPages(
  filters: ReportFilters,
  limit = 10,
) {
  const result = await prisma.event.groupBy({
    by: ['path'],
    where: {
      ...eventWhere(filters),
      type: 'pageview',
    },
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take: limit,
  });

  return result.map((row) => ({
    path: row.path ?? '/',
    count: row._count.path,
  }));
}

export async function getTrafficSources(
  filters: ReportFilters,
  limit = 10,
) {
  const result = await prisma.event.groupBy({
    by: ['referrer'],
    where: eventWhere(filters),
    _count: {
      referrer: true,
    },
    orderBy: {
      _count: {
        referrer: 'desc',
      },
    },
    take: limit,
  });

  return result.map((row) => ({
    referrer: row.referrer || 'Direct',
    count: row._count.referrer,
  }));
}

export async function getTimeSeries(filters: ReportFilters) {
  const events = await prisma.event.findMany({
    where: eventWhere(filters),
    select: {
      createdAt: true,
      type: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const buckets = new Map<string, number>();

  for (const event of events) {
    const key = event.createdAt.toISOString().slice(0, 13);

    buckets.set(
      key,
      (buckets.get(key) ?? 0) + 1,
    );
  }

  return Array.from(buckets.entries()).map(
    ([time, count]) => ({
      time,
      count,
    }),
  );
}