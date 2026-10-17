import type { Metadata } from "next";
import { QueryClientPage } from "@/components/dashboard/QueryClientPage";

export const metadata: Metadata = { title: "Query" };

export default function QueryPage() {
  return <QueryClientPage />;
}