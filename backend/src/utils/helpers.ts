import { customAlphabet } from 'nanoid';
import crypto from 'crypto';

export const generateId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  24
);

export function hashVisitorId(visitorId: string, salt: string): string {
  return crypto
    .createHmac('sha256', salt)
    .update(visitorId)
    .digest('hex')
    .slice(0, 16);
}

export function parseUserAgent(ua: string) {
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const device = detectDevice(ua);
  return { browser, os, device };
}

function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return 'Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'Unknown';
}

function detectOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ios/i.test(ua)) return 'iOS';
  return 'Unknown';
}

function detectDevice(ua: string): string {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

export function getReferrerGroup(referrer: string | null): string {
  if (!referrer) return 'Direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace('www.', '');
    if (/google|bing|yahoo|duckduckgo/i.test(host)) return 'Search';
    if (/facebook|twitter|x\.com|linkedin|instagram|tiktok/i.test(host))
      return 'Social';
    return host;
  } catch {
    return 'Direct';
  }
}