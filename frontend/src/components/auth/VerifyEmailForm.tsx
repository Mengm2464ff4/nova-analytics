"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

type State =
  | { kind: "idle" }
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function VerifyEmailForm({
  token,
  email: initialEmail,
}: {
  token?: string;
  email?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>(
    token ? { kind: "verifying" } : { kind: "idle" }
  );
  const [email, setEmail] = useState(initialEmail ?? "");
  const [resending, setResending] = useState(false);

  // Auto-verify if a token was passed in the URL
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        await api.post("/auth/verify-email", { token });
        if (!cancelled) setState({ kind: "success" });
      } catch (err) {
        const msg =
          err instanceof ApiClientError
            ? err.message
            : "Verification failed";
        if (!cancelled) setState({ kind: "error", message: msg });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Resend with visible feedback
  async function resend() {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }

    setResending(true);
    try {
      await api.post("/auth/resend-verification", {
        email: email.trim(),
      });
      toast.success("Verification email sent. Check your inbox.");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Could not resend email";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }

  if (state.kind === "verifying") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <Spinner className="h-8 w-8" />
        <p className="mt-4 text-sm text-muted-foreground">
          Verifying your email…
        </p>
      </div>
    );
  }

  if (state.kind === "success") {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          Your email has been verified. You can now sign in.
        </p>
        <Link href="/login">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="text-sm text-muted-foreground">{state.message}</p>

        {!initialEmail && (
          <div className="text-left">
            <Label htmlFor="email">Your email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <Button className="w-full" loading={resending} onClick={resend}>
          Resend verification email
        </Button>
      </div>
    );
  }

  // Idle — user landed on the page without a token
  return (
    <div className="space-y-4">
      <Mail className="mx-auto h-12 w-12 text-primary" />

      {!initialEmail && (
        <div className="text-left">
          <Label htmlFor="email">Your email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get the email? Check spam, or resend it below.
      </p>

      <Button className="w-full" loading={resending} onClick={resend}>
        Resend verification email
      </Button>

      <Link
        href="/login"
        className="block text-center text-sm text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}