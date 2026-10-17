import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(3).max(255),
});

// GET /api/sites — returns array (frontend expects plain array)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const role = req.user!.role;

    const sites = await prisma.site.findMany({
      where: role === 'ADMIN' ? {} : { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sites);          // ← plain array, NOT { sites }
  } catch (err) {
    next(err);
  }
});

// POST /api/sites
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const site = await prisma.site.create({
      data: {
        name: data.name,
        domain: data.domain,
        userId: req.user!.sub,   // ← userId, not ownerId; sub, not id
      },
    });
    res.status(201).json(site);
  } catch (err) {
    next(err);
  }
});

// GET /api/sites/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const site = await prisma.site.findFirst({
      where: {
        id,
        ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.sub }),
      },
    });
    if (!site) {
      return res.status(404).json({ error: true, message: 'Site not found' });
    }
    res.json(site);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sites/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.site.deleteMany({
      where: {
        id,
        ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.sub }),
      },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;