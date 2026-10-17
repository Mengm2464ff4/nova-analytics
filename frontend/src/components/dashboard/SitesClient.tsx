"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSites, useCreateSite, useDeleteSite } from "@/hooks/useSites";
import {
  siteCreateSchema,
  type SiteCreateSchema,
} from "@/lib/validations/site.schema";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

export function SitesClient() {
  const { data: sites, isLoading } = useSites();
  const createSite = useCreateSite();
  const deleteSite = useDeleteSite();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteCreateSchema>({ resolver: zodResolver(siteCreateSchema) });

  async function onSubmit(values: SiteCreateSchema) {
    await createSite.mutateAsync(values);
    reset();
    setOpen(false);
  }

  function copySnippet(trackingKey: string) {
    const snippet = `<script defer src="${window.location.origin}/track.js" data-site="${trackingKey}"></script>`;
    navigator.clipboard.writeText(snippet);
    toast.success("Tracking snippet copied");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Sites</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New site
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : !sites || sites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No sites yet. Click <strong>New site</strong> to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {site.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {site.domain}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(site.id)}
                    aria-label="Delete site"
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/sites/${site.id}`}>
                    <Button size="sm" variant="outline">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copySnippet(site.trackingKey)}
                    title="Copy tracking snippet"
                  >
                    <Copy className="h-3.5 w-3.5" /> Snippet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a site"
        description="Add a domain you want to track."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My blog"
              error={!!errors.name}
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              error={!!errors.domain}
              {...register("domain")}
            />
            <FieldError>{errors.domain?.message}</FieldError>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createSite.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this site?"
        description="This will permanently remove all tracking data. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteSite.isPending}
              onClick={async () => {
                if (confirmDelete) {
                  await deleteSite.mutateAsync(confirmDelete);
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