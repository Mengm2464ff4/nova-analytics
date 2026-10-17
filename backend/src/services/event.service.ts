import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';

export interface TrackPayload {
  siteId: string;
  visitorId: string;
  sessionId?: string;
  type: string;
  name?: string;
  url?: string;
  path?: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
  userAgent?: string;
  ip?: string;
  screenW?: number;
  screenH?: number;
}

function hashIp(ip?: string): string {
  const value = ip ?? 'unknown-ip';
  const salt = process.env.TRACKING_SALT ?? 'development-salt';

return crypto
    .createHash('sha256')
    .update(`${salt}:${value}`)
    .digest('hex');
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordEvent(payload: TrackPayload) {
  const metadata = {
    sessionId: payload.sessionId,
    name: payload.name,
    url: payload.url,
    title: payload.title,
    properties: payload.properties,
    userAgent: payload.userAgent,
    screenW: payload.screenW,
    screenH: payload.screenH,
  };

const event = await prisma.event.create({
    data: {
      siteId: payload.siteId,
      visitorId: payload.visitorId,
      type: payload.type,
      path: payload.path ?? '/',
      referrer: payload.referrer,
      ipHash: hashIp(payload.ip),
      metadata: JSON.parse(
        JSON.stringify(metadata),
      ) as Prisma.InputJsonValue,
    },
  });

const realtimeKey = `realtime:${payload.siteId}`;

await redis.lpush(
    realtimeKey,
    JSON.stringify({
      id: event.id,
      type: event.type,
      path: event.path,
      timestamp: event.createdAt.toISOString(),
    }),
  );

await redis.ltrim(realtimeKey, 0, 99);

const statsKey = `stats:${payload.siteId}:events:${todayKey()}`;

await redis.incr(statsKey);
  await redis.expire(statsKey, 86400 * 2);

logger.debug(`Event recorded: ${event.id} (${event.type})`);

return event;
}

export async function getRealtimeEvents(
  siteId: string,
  limit = 50,
) {
  const raw = await redis.lrange(
    `realtime:${siteId}`,
    0,
    limit - 1,
  );

return raw.map((item) => JSON.parse(item));
}
