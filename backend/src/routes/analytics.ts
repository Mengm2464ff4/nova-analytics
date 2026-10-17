import { Router } from 'express';
import type { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

import {
  getOverview,
  getTopPages,
  getTrafficSources,
  getTimeSeries,
} from '../services/report.service';

import { getRealtimeEvents } from '../services/event.service';

const router = Router();

function parseRange(query: Request['query']) {
  const now = new Date();
  const range = String(query.range ?? '30d');

const durations: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

const to = query.to
    ? new Date(String(query.to))
    : now;

const from = query.from
    ? new Date(String(query.from))
    : new Date(
        to.getTime() - (durations[range] ?? durations['30d']),
      );

if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    throw new Error('Invalid date range');
  }

return { from, to };
}


function getSiteId(req: Request): string {
  return String(req.query.siteId ?? '').trim();
}

function requireSiteId(
  req: Request,
  res: Response,
): string | null {
  const siteId = getSiteId(req);

if (!siteId) {
    res.status(400).json({
      error: true,
      message: 'siteId is required',
    });

return null;
  }

return siteId;
}

async function getOwnedSite(
  req: Request,
  res: Response,
) {
  const siteId = requireSiteId(req, res);

if (!siteId) {
    return null;
  }

const userId = req.user?.sub;

console.log('[analytics] requested siteId:', siteId);
  console.log('[analytics] authenticated userId:', userId);

if (!userId) {
    res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });

return null;
  }

const site = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
    select: {
      id: true,
      userId: true,
      trackingKey: true,
    },
  });

console.log('[analytics] database site:', site);

if (!site) {
    res.status(404).json({
      error: true,
      message: `Site ID does not exist: ${siteId}`,
    });

return null;
  }

if (
  site.userId !== userId &&
  req.user?.role !== 'ADMIN'
) {
  res.status(403).json({
    error: true,
    message: 'Site belongs to another user',
  });

return null;
}


return site;
}



router.get(
  '/overview',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);

if (!site) {
        return;
      }

const { from, to } = parseRange(req.query);

const data = await getOverview({
        siteId: site.id,
        from,
        to,
      });

return res.json(data);
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  '/pages',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);

if (!site) {
        return;
      }

const { from, to } = parseRange(req.query);

const pages = await getTopPages({
        siteId: site.id,
        from,
        to,
      });

return res.json({ pages });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  '/sources',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);

if (!site) {
        return;
      }

const { from, to } = parseRange(req.query);

const sources = await getTrafficSources({
        siteId: site.id,
        from,
        to,
      });

return res.json({ sources });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  '/timeseries',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);

if (!site) {
        return;
      }

const { from, to } = parseRange(req.query);

const series = await getTimeSeries({
        siteId: site.id,
        from,
        to,
      });

return res.json({ series });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  '/realtime',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);

if (!site) {
        return;
      }

const events = await getRealtimeEvents(
        site.id,
        50,
      );

return res.json({ events });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  '/query',
  requireAuth,
  async (req: Request, res, next) => {
    try {
      const site = await getOwnedSite(req, res);
      if (!site) return;

      const { metric, groupBy, range, filters } = req.body;

      const { from, to } = parseRange({ range } as any);

      const where: any = {
        siteId: site.id,
        createdAt: { gte: from, lte: to },
      };

      for (const f of filters ?? []) {
        const { field, op, value } = f;
        if (!field || !op || value === undefined || value === '') continue;

        switch (op) {
          case 'eq':
            where[field] = value;
            break;
          case 'neq':
            where[field] = { not: value };
            break;
          case 'contains':
            where[field] = { contains: value, mode: 'insensitive' };
            break;
          case 'gt':
            where[field] = { gt: value };
            break;
          case 'lt':
            where[field] = { lt: value };
            break;
          case 'in':
            where[field] = { in: String(value).split(',') };
            break;
        }
      }

      if (groupBy === 'none') {
        let count = 0;

        if (metric === 'visitors') {
          const rows = await prisma.event.findMany({
            where: { ...where, visitorId: { not: null } },
            select: { visitorId: true },
            distinct: ['visitorId'],
          });
          count = rows.length;
        } else if (metric === 'pageviews') {
          count = await prisma.event.count({
            where: { ...where, type: 'pageview' },
          });
        } else if (metric === 'sessions') {
          count = await prisma.sessionRecord.count({
            where: {
              siteId: site.id,
              startedAt: { gte: from, lte: to },
            },
          });
        }

        return res.json({
          columns: [metric],
          rows: [{ [metric]: count }],
        });
      }

      const rows = await prisma.event.groupBy({
        by: [groupBy as any],
        where,
        _count: { _all: true },
        orderBy: { _count: { [groupBy as any]: 'desc' } } as any,
        take: 50,
      });

      const columns = [groupBy, metric];
      const formatted = rows.map((r: any) => ({
        [groupBy]: r[groupBy] ?? '(none)',
        [metric]: r._count._all,
      }));

      return res.json({ columns, rows: formatted });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
