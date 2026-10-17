/**
 * Lightweight geo lookup based on request headers.
 * In production, replace with MaxMind GeoIP2 database.
 */
export interface GeoData {
  country: string | null;
  city: string | null;
  region: string | null;
}

export function lookupGeo(ip: string): GeoData {
  // Placeholder — integrate MaxMind or IPinfo here
  // This prevents the app from crashing without external dependency
  return {
    country: null,
    city: null,
    region: null,
  };
}

export function getClientIp(req: any): string {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}