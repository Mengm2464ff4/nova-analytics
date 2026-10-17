import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({
  title,
  description,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}