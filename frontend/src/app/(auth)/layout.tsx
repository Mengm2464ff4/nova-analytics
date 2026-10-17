import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-semibold"
      >
        <BarChart3 className="h-6 w-6 text-primary" />
        Nova Analytics
      </Link>

      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nova Analytics
      </p>
    </div>
  );
}