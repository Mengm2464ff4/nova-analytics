"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "./useAuth";

export type ReportSchedule = "daily" | "weekly" | "monthly";
export type ReportFormat = "csv" | "json" | "pdf";

export interface Report {
  id: string;
  userId: string;
  name: string;
  schedule: ReportSchedule;
  recipients: string[];
  format: ReportFormat;
  lastSentAt: string | null;
  nextRunAt: string;
  createdAt?: string;
}

export interface CreateReportInput {
  name: string;
  schedule: ReportSchedule;
  recipients: string[];
  format: ReportFormat;
  nextRunAt: string;
}

const keys = {
  all: ["reports"] as const,
  list: () => [...keys.all, "list"] as const,
};

async function fetchReports(token: string | null): Promise<Report[]> {
  const res = await api.get<{ reports: Report[] }>("/reports", { token });
  return res.reports ?? [];
}

async function createReport(
  token: string | null,
  input: CreateReportInput
): Promise<Report> {
  const res = await api.post<{ report: Report }>("/reports", input, { token });
  return res.report;
}

async function deleteReport(token: string | null, id: string): Promise<void> {
  return api.delete<void>(`/reports/${id}`, { token });
}

export function useReports() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: keys.list(),
    queryFn: () => fetchReports(accessToken),
    enabled: isAuthenticated,
  });
}

export function useCreateReport() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReportInput) =>
      createReport(accessToken, input),
    onSuccess: (report) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success(`Report "${report.name}" created`);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not create report"
      );
    },
  });
}

export function useDeleteReport() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReport(accessToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success("Report deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete report"
      );
    },
  });
}