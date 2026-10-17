import type { Metadata } from "next";
import { RealtimeClient } from "@/components/dashboard/RealtimeClient";

export const metadata: Metadata = { title: "Real-time" };

export default function RealtimePage() {
  return <RealtimeClient />;
}