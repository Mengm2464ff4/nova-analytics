// import { Router } from 'express';
// import { prisma } from '../lib/prisma';
// import { requireAuth, requireAdmin } from '../middleware/auth';

// const router = Router();

// // GET /api/admin/stats
// router.get('/stats', requireAuth, requireAdmin, async (_req, res) => {
//   const [totalUsers, totalSites, totalEvents, totalSessions] = await Promise.all([
//     prisma.user.count(),
//     prisma.site.count(),
//     prisma.event.count(),
//     prisma.sessionRecord.count(),
//   ]);

//   res.json({ totalUsers, totalSites, totalEvents, totalSessions });
// });

// export default router;
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/stats
// router.get('/stats', requireAuth, requireAdmin, async (_req, res) => {
//   const [
//     users,
//     accounts,
//     sessions,
//     verificationTokens,
//     passwordResetTokens,
//     sites,
//     events,
//     sessionRecords,
//     widgets,
//     reports,
//   ] = await Promise.all([
//     prisma.user.count(),
//     prisma.account.count(),
//     prisma.session.count(),
//     prisma.verificationToken.count(),
//     prisma.passwordResetToken.count(),
//     prisma.site.count(),
//     prisma.event.count(),
//     prisma.sessionRecord.count(),
//     prisma.widget.count(),
//     prisma.report.count(),
//   ]);

//   res.json({
//     models: [
//       { name: 'User', count: users },
//       { name: 'Account', count: accounts },
//       { name: 'Session', count: sessions },
//       { name: 'VerificationToken', count: verificationTokens },
//       { name: 'PasswordResetToken', count: passwordResetTokens },
//       { name: 'Site', count: sites },
//       { name: 'Event', count: events },
//       { name: 'SessionRecord', count: sessionRecords },
//       { name: 'Widget', count: widgets },
//       { name: 'Report', count: reports },
//     ],
//   });
// });

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalSites,
      totalEvents,
      totalSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.event.count(),
      prisma.sessionRecord.count(),
    ]);

    res.json({
      totalUsers,
      totalSites,
      totalEvents,
      totalSessions,
    });
  } catch (err) {
    next(err);
  }
});

export default router;