import type { Metadata } from "next";
import { SitesClient } from "@/components/dashboard/SitesClient";

export const metadata: Metadata = { title: "Sites" };

export default function SitesPage() {
  return <SitesClient />;
}