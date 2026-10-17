import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your Nova Analytics account.",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Nova Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in or create an account with one click.
        </p>
      </div>
      
      {/* Wrapped in Suspense to fix the Next.js build error */}
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}