"use client";

import { useState } from "react";
import { Trash2, Users, Globe, Activity, Radio } from "lucide-react";
import {
  useUsers,
  useAdminStats,
  useUpdateUserRole,
  useDeleteUser,
} from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

export function AdminClient() {
  const { user: me } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: stats } = useAdminStats();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={stats?.totalUsers ?? 0} />
        <StatCard icon={Globe} label="Sites" value={stats?.totalSites ?? 0} />
        <StatCard icon={Activity} label="Events" value={stats?.totalEvents ?? 0} />
        <StatCard icon={Radio} label="Sessions" value={stats?.totalSessions ?? 0} />
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : !users || users.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Sites
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === me?.id;
                    return (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium">
                            {u.name ?? "—"}
                            {isSelf && (
                              <Badge variant="secondary" className="ml-2">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf || updateRole.isPending}
                            onChange={(e) =>
                              updateRole.mutate({
                                id: u.id,
                                role: e.target.value as AdminUser["role"],
                              })
                            }
                            className={cn(
                              "h-8 rounded-md border bg-background px-2 text-xs",
                              isSelf && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 tabular-nums">
                          {u._count?.sites ?? 0}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isSelf}
                            onClick={() => setConfirmDelete(u)}
                            aria-label="Delete user"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete user?"
        description={`This will permanently delete ${confirmDelete?.email} and all their data.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteUser.isPending}
              onClick={async () => {
                if (confirmDelete) {
                  await deleteUser.mutateAsync(confirmDelete.id);
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}