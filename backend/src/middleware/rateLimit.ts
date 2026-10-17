import rateLimit from 'express-rate-limit';
import { redis } from '../lib/redis';

// Simple rate limiter using express-rate-limit (in-memory)
export const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // 600 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many requests' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many attempts, try later' },
});

// Redis-based per-site rate limiter
export async function checkSiteRateLimit(
  siteId: string,
  limit = 1000
): Promise<boolean> {
  const key = `ratelimit:site:${siteId}:${Math.floor(Date.now() / 60000)}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}