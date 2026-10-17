import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteDetailClient } from "@/components/dashboard/SiteDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Site · ${id.slice(0, 6)}` };
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();
  return <SiteDetailClient siteId={id} />;
}