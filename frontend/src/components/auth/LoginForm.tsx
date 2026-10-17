"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleButton } from "./GoogleButton";
import { GitHubButton } from "./GitHubButton";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginSchema) {
    console.log("🔥 onSubmit");
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // ✅ Direct backend call
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();
      console.log("🔥 Backend:", res.status, data);

      // Google user
      if (data?.code === "USE_GOOGLE_LOGIN") {
        toast.info("This account uses Google. Redirecting...");
        await signIn("google", {
          callbackUrl,
          login_hint: values.email,
        });
        return;
      }

      // Email not verified
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email first.");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        return;
      }

      // Wrong credentials
      if (!res.ok) {
        setErrorMsg(data?.message ?? "Invalid email or password");
        toast.error(data?.message ?? "Invalid email or password");
        return;
      }

      // ✅ Success — Save to localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Also call NextAuth to establish session
      try {
        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });
      } catch (e) {
        console.log("NextAuth warning:", e);
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("🔥 Error:", err);
      setErrorMsg("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
         <GoogleButton callbackUrl={callbackUrl} />
         <GitHubButton callbackUrl={callbackUrl} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground tracking-wide">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@gmail.com"
            error={!!errors.email}
            className="h-11 px-4 text-sm"
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={!!errors.password}
            className="h-11 px-4 text-sm"
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        {errorMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-sm font-medium"
          loading={submitting}
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}