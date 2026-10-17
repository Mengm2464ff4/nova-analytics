import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────────
// USER SELF ROUTES (must come before /:id routes)
// ─────────────────────────────────────────────

// GET /api/users/me — get current user's profile
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

// PATCH /api/users/me — update current user's profile
router.patch('/me', requireAuth, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(64).optional(),
    image: z.string().url().nullable().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      name: parsed.data.name,
      image: parsed.data.image,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  });

  res.json(user);
});

// POST /api/users/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return res.status(400).json({ message: 'No password set' });
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.user!.sub },
    data: { passwordHash },
  });

  res.json({ ok: true });
});

// DELETE /api/users/me/delete — delete own account
router.post('/me/delete', requireAuth, async (req, res) => {
  const schema = z.object({
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Password required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return res.status(400).json({ message: 'No password set' });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Password is incorrect' });
  }

  await prisma.user.delete({ where: { id: req.user!.sub } });

  res.status(204).end();
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// GET /api/users — list all users (admin only)
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { sites: true } },
    },
  });
  res.json(users);
});

// PATCH /api/users/:id/role — change a user's role (admin only)
router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.object({
    role: z.enum(['USER', 'ADMIN', 'VIEWER']),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const id = req.params.id as string;
  if (id === req.user!.sub) {
    return res.status(400).json({ message: 'You cannot change your own role' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { sites: true } },
    },
  });
  res.json(user);
});

// DELETE /api/users/:id — delete a user (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id as string;
  if (id === req.user!.sub) {
    return res.status(400).json({ message: 'You cannot delete yourself' });
  }
  await prisma.user.delete({ where: { id } });
  res.status(204).end();
});

export default router;