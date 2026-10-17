"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  useReports,
  useCreateReport,
  useDeleteReport,
  type ReportSchedule,
  type ReportFormat,
} from "@/hooks/useReports";

export function ReportsClient() {
  const { data: reports, isLoading } = useReports();
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState<ReportSchedule>("weekly");
  const [recipients, setRecipients] = useState("");
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function create() {
    if (!name.trim()) return;

    const emails = recipients
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      return;
    }

    // Compute next run time based on schedule
    const now = new Date();
    let nextRunAt = new Date(now);
    if (schedule === "daily") {
      nextRunAt.setDate(nextRunAt.getDate() + 1);
      nextRunAt.setHours(8, 0, 0, 0);
    } else if (schedule === "weekly") {
      nextRunAt.setDate(nextRunAt.getDate() + 7);
      nextRunAt.setHours(8, 0, 0, 0);
    } else if (schedule === "monthly") {
      nextRunAt.setMonth(nextRunAt.getMonth() + 1);
      nextRunAt.setDate(1);
      nextRunAt.setHours(8, 0, 0, 0);
    }

    createReport.mutate(
      {
        name: name.trim(),
        schedule,
        recipients: emails,
        format,
        nextRunAt: nextRunAt.toISOString(),
      },
      {
        onSuccess: () => {
          setName("");
          setRecipients("");
          setSchedule("weekly");
          setFormat("csv");
          setOpen(false);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New report
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No reports yet. Click <strong>New report</strong> to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="min-w-0">
                  <CardTitle>{r.name}</CardTitle>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {r.recipients.join(", ")} · {r.format.toUpperCase()} · next:{" "}
                    {new Date(r.nextRunAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.schedule}</Badge>
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    aria-label="Delete report"
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New report"
        description="Schedule recurring analytics reports to your inbox."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} loading={createReport.isPending}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="rname">Name</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekly summary"
            />
          </div>
          <div>
            <Label htmlFor="rsched">Schedule</Label>
            <select
              id="rsched"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as ReportSchedule)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <Label htmlFor="rrecipients">Recipients (comma separated)</Label>
            <Input
              id="rrecipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="you@example.com, team@example.com"
            />
          </div>
          <div>
            <Label htmlFor="rformat">Format</Label>
            <select
              id="rformat"
              value={format}
              onChange={(e) => setFormat(e.target.value as ReportFormat)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this report?"
        description="This will permanently remove the scheduled report."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteReport.isPending}
              onClick={async () => {
                if (confirmDelete) {
                  await deleteReport.mutateAsync(confirmDelete);
                  setConfirmDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}