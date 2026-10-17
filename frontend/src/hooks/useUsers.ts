"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { AdminUser, AdminStats } from "@/types/user";

const keys = {
  all: ["admin", "users"] as const,
  list: () => [...keys.all, "list"] as const,
  stats: () => ["admin", "stats"] as const,
};

export function useUsers() {
  const { accessToken, isAdmin } = useAuth();
  return useQuery({
    queryKey: keys.list(),
    queryFn: () =>
      api.get<AdminUser[]>("/users", { token: accessToken }),
    enabled: isAdmin,
  });
}

export function useAdminStats() {
  const { accessToken, isAdmin } = useAuth();
  return useQuery({
    queryKey: keys.stats(),
    queryFn: () =>
      api.get<AdminStats>("/admin/stats", { token: accessToken }),
    enabled: isAdmin,
  });
}

export function useUpdateUserRole() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: AdminUser["role"];
    }) =>
      api.patch<AdminUser>(`/users/${id}/role`, { role }, { token: accessToken }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success("Role updated");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update role"
      );
    },
  });
}

export function useDeleteUser() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(`/users/${id}`, { token: accessToken }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success("User deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete user"
      );
    },
  });
}