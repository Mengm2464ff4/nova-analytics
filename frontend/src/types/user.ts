export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER" | "ADMIN" | "VIEWER";
  createdAt: string;
  _count?: {
    sites: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalSites: number;
  totalEvents: number;
  totalSessions: number;
}