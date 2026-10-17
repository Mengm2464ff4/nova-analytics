
export interface Site {
  id: string;
  name: string;
  domain: string;
  trackingKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteCreateInput {
  name: string;
  domain: string;
}