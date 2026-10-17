import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

type SiteParams = {
  siteId: string;
};

type WidgetParams = {
  id: string;
};

const widgetSchema = z.object({
  siteId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  config: z.record(z.string(), z.unknown()),
  position: z.number().int().optional(),
});

router.get(
  '/:siteId',
  requireAuth,
  async (req: Request<SiteParams>, res, next) => {
    try {
      const userId = req.user?.sub;

if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }

const site = await prisma.site.findFirst({
        where: {
          id: req.params.siteId,
          userId,
        },
      });

if (!site) {
        return res.status(404).json({
          error: true,
          message: 'Site not found',
        });
      }

const widgets = await prisma.widget.findMany({
        where: {
          siteId: site.id,
        },
        orderBy: {
          position: 'asc',
        },
      });

return res.json({ widgets });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/', requireAuth, async (req: Request, res, next) => {
  try {
    const userId = req.user?.sub;

if (!userId) {
      return res.status(401).json({
        error: true,
        message: 'Unauthorized',
      });
    }

const parsed = widgetSchema.parse(req.body);

const site = await prisma.site.findFirst({
      where: {
        id: parsed.siteId,
        userId,
      },
    });

if (!site) {
      return res.status(404).json({
        error: true,
        message: 'Site not found',
      });
    }

const widget = await prisma.widget.create({
      data: {
        siteId: site.id,
        type: parsed.type,
        title: parsed.title,
        config: JSON.parse(JSON.stringify(parsed.config)),
        position: parsed.position ?? 0,
      },
    });

return res.status(201).json({ widget });
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/:id',
  requireAuth,
  async (req: Request<WidgetParams>, res, next) => {
    try {
      const userId = req.user?.sub;

if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }

const widget = await prisma.widget.findFirst({
        where: {
          id: req.params.id,
          site: {
            userId,
          },
        },
      });

if (!widget) {
        return res.status(404).json({
          error: true,
          message: 'Widget not found',
        });
      }

await prisma.widget.delete({
        where: {
          id: widget.id,
        },
      });

return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
