"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useDashboardStore } from "@/stores/dashboardStore";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  useMe,
  useUpdateMe,
  useChangePassword,
  useDeleteMe,
} from "@/hooks/useProfile";  // ← ត្រូវ

export function SettingsClient() {
  const { user, role } = useAuth();
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();
  const deleteMe = useDeleteMe();
  const collapsed = useDashboardStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (me?.name) setName(me.name);
    else if (user?.name) setName(user.name);
  }, [me, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const email = me?.email ?? user?.email ?? "";
  const userRole = me?.role ?? role ?? "USER";

  function handleSaveProfile() {
    updateMe.mutate({ name: name.trim() });
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
        },
      }
    );
  }

  function handleDeleteAccount() {
    if (!deletePassword) return;
    deleteMe.mutate(deletePassword);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary">{userRole}</Badge>
          </div>
          <Button
            onClick={handleSaveProfile}
            loading={updateMe.isPending}
            disabled={!name.trim() || name === me?.name}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
  <Label htmlFor="currentPassword">Current password</Label>
  <PasswordInput
    id="currentPassword"
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    placeholder="••••••••"
  />
    </div>
        <div>
         <Label htmlFor="newPassword">New password</Label>
         <PasswordInput
             id="newPassword"
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             placeholder="Min 8 characters"
           />
        </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            loading={changePassword.isPending}
            disabled={!currentPassword || newPassword.length < 8}
          >
            Change password
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleSidebar}>
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. All your
            sites, events, and data will be permanently removed.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword("");
        }}
        title="Delete your account?"
        description="This will permanently delete your account and all associated data. This cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteMe.isPending}
              disabled={!deletePassword}
              onClick={handleDeleteAccount}
            >
              Delete forever
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Type your password to confirm:
          </p>
            <div>
  <Label htmlFor="deletePassword">Password</Label>
  <PasswordInput
    id="deletePassword"
    value={deletePassword}
    onChange={(e) => setDeletePassword(e.target.value)}
    placeholder="••••••••"
  />
</div>
        </div>
      </Modal>
    </div>
  );
}