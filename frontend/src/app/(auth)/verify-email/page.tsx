import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your Nova Analytics email address.",
};

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token, email } = await searchParams;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {token ? "Verifying your email…" : "Check your inbox"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {token
            ? "Hang tight while we verify your email."
            : `We sent a verification link${
                email ? ` to ${email}` : ""
              }. Click it to activate your account.`}
        </p>
      </div>
      <VerifyEmailForm token={token} email={email} />
    </>
  );
}