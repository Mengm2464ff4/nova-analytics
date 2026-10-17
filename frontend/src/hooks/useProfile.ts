"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt?: string;
}

const keys = {
  all: ["profile"] as const,
  me: () => [...keys.all, "me"] as const,
};

async function fetchMe(token: string | null): Promise<UserProfile> {
  return api.get<UserProfile>("/users/me", { token });
}

async function updateMe(
  token: string | null,
  input: { name?: string; image?: string | null }
): Promise<UserProfile> {
  return api.patch<UserProfile>("/users/me", input, { token });
}

async function changePassword(
  token: string | null,
  input: { currentPassword: string; newPassword: string }
): Promise<{ ok: true }> {
  return api.post<{ ok: true }>("/users/change-password", input, { token });
}

async function deleteMe(
  token: string | null,
  password: string
): Promise<void> {
  return api.post<void>("/users/me/delete", { password }, { token });
}

export function useMe() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: keys.me(),
    queryFn: () => fetchMe(accessToken),
    enabled: isAuthenticated,
  });
}

export function useUpdateMe() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: { name?: string; image?: string | null }) =>
      updateMe(accessToken, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update"
      );
    },
  });
}

export function useChangePassword() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (input: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(accessToken, input),
    onSuccess: () => {
      toast.success("Password changed");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not change"
      );
    },
  });
}

export function useDeleteMe() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (password: string) => deleteMe(accessToken, password),
    onSuccess: () => {
      toast.success("Account deleted");
      window.location.href = "/login";
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete"
      );
    },
  });
}