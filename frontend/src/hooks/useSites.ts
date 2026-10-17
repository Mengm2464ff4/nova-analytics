"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { Site, SiteCreateInput } from "@/types/site";

const keys = {
  all: ["sites"] as const,
  list: () => [...keys.all, "list"] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

async function fetchSites(token: string | null): Promise<Site[]> {
  return api.get<Site[]>("/sites", { token });
}

async function fetchSite(token: string | null, id: string): Promise<Site> {
  return api.get<Site>(`/sites/${id}`, { token });
}

async function createSite(
  token: string | null,
  input: SiteCreateInput
): Promise<Site> {
  return api.post<Site>("/sites", input, { token });
}

async function deleteSite(token: string | null, id: string): Promise<void> {
  return api.delete<void>(`/sites/${id}`, { token });
}

// ---------- public hooks ----------

export function useSites() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: keys.list(),
    queryFn: () => fetchSites(accessToken),
    enabled: isAuthenticated,
  });
}

export function useSite(id: string | undefined) {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: id ? keys.detail(id) : ["sites", "detail", "none"],
    queryFn: () => fetchSite(accessToken, id as string),
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateSite() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SiteCreateInput) => createSite(accessToken, input),
    onSuccess: (site) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success(`Site "${site.name}" created`);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not create site"
      );
    },
  });
}

export function useDeleteSite() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSite(accessToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success("Site deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete site"
      );
    },
  });
}

// Expose keys for other hooks to invalidate
export const siteKeys = keys;