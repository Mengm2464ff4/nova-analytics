import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { recordEvent } from '../services/event.service';
import { getOrCreateSession } from '../services/session.service';
import { emitEvent } from '../services/realtime.service';
import { parseUserAgent, hashVisitorId } from '../utils/helpers';
import { trackLimiter } from '../middleware/rateLimit';
import { getClientIp, lookupGeo } from '../lib/geo';

const router = Router();

const trackSchema = z.object({
  // Public tracking key stored in Site.trackingKey
  siteId: z.string().min(1),

visitorId: z.string().min(1),

type: z.enum([
    'pageview',
    'custom',
    'outbound',
    'download',
  ]),

name: z.string().optional(),
  url: z.string().optional(),
  path: z.string().optional(),
  title: z.string().optional(),
  referrer: z.string().optional(),

properties: z
    .record(z.string(), z.any())
    .optional(),

screenW: z.number().optional(),
  screenH: z.number().optional(),
});

router.post('/', trackLimiter, async (req, res, next) => {
  try {
    const data = trackSchema.parse(req.body);

const site = await prisma.site.findUnique({
      where: {
        trackingKey: data.siteId,
      },
    });

if (!site) {
      return res.status(404).json({
        error: true,
        message: 'Site not found',
      });
    }

const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] ?? '';

const { browser, os, device } =
      parseUserAgent(userAgent);

const geo = lookupGeo(ip);

const trackingSalt = process.env.TRACKING_SALT;

if (!trackingSalt) {
      throw new Error(
        'TRACKING_SALT is not configured',
      );
    }

const visitorId = hashVisitorId(
      data.visitorId,
      trackingSalt,
    );

const session = await getOrCreateSession(
  site.id,
  visitorId,
  {
    device,
    country: geo.country ?? undefined,
  },
);


const event = await recordEvent({
      siteId: site.id,
      visitorId,
      sessionId: session.id,

type: data.type,
      name: data.name,
      url: data.url,
      path: data.path,
      title: data.title,
      referrer: data.referrer,
      properties: data.properties,

userAgent,
      ip,
      screenW: data.screenW,
      screenH: data.screenH,
    });

// emitEvent(site.id, {
//       id: event.id,
//       type: event.type,
//       path: event.path,
//       timestamp: event.createdAt,
//     });
emitEvent(site.id, {
  id: event.id,
  siteId: site.id,                          // ← បន្ថែម
  type: event.type,
  path: event.path,
  country: geo.country ?? undefined,         // ← បន្ថែម
  city: geo.city ?? undefined,               // ← បន្ថែម
  browser,                                    // ← បន្ថែម
  os,                                         // ← បន្ថែម
  device,                                     // ← បន្ថែម
  timestamp: event.createdAt.toISOString(),  // ← ប្តូរទៅ string
});

return res.json({
      ok: true,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
