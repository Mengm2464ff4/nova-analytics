import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminClient } from "@/components/dashboard/AdminClient";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  // Server-side guard — client guard is cosmetic
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminClient />;
}