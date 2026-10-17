import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

type ReportParams = {
  id: string;
};

const reportSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().min(1),
  recipients: z.array(z.string().email()),
  format: z.string().min(1),
  nextRunAt: z.coerce.date(),
});

function getUserId(req: Request): string | null {
  return req.user?.sub ?? null;
}

router.get('/', requireAuth, async (req: Request, res, next) => {
  try {
    const userId = getUserId(req);

if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

const reports = await prisma.report.findMany({
      where: {
        userId,
      },
      orderBy: {
        nextRunAt: 'asc',
      },
    });

return res.json({ reports });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req: Request, res, next) => {
  try {
    const userId = getUserId(req);

if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

const parsed = reportSchema.parse(req.body);

const report = await prisma.report.create({
      data: {
        userId,
        name: parsed.name,
        schedule: parsed.schedule,
        recipients: parsed.recipients,
        format: parsed.format,
        nextRunAt: parsed.nextRunAt,
      },
    });

return res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/:id',
  requireAuth,
  async (req: Request<ReportParams>, res, next) => {
    try {
      const userId = getUserId(req);

if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

const report = await prisma.report.findFirst({
        where: {
          id: req.params.id,
          userId,
        },
      });

if (!report) {
        return res.status(404).json({
          message: 'Report not found',
        });
      }

await prisma.report.delete({
        where: {
          id: report.id,
        },
      });

return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
