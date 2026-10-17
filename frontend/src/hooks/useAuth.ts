"use client";

import { useSession } from "next-auth/react";
import type { AppUser, Role } from "@/types/auth";

interface UseAuthResult {
  user: AppUser | null;
  accessToken: string | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth(): UseAuthResult {
  const { data, status } = useSession();

  const user = (data?.user as AppUser | undefined) ?? null;
  const accessToken = (data as any)?.accessToken ?? null;
  const role = (user?.role as Role) ?? "USER";

  return {
    user,
    accessToken,
    role,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: role === "ADMIN",
  };
}