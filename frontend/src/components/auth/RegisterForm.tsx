"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  registerSchema,
  type RegisterSchema,
} from "@/lib/validations/auth.schema";
import { api, ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleButton } from "./GoogleButton";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterSchema) {
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      toast.success("Account created — check your email to verify.");
      router.push(
        `/verify-email?email=${encodeURIComponent(values.email)}`
      );
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Could not create account";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <GoogleButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground tracking-wide">
            or sign up with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Doe"
            error={!!errors.name}
            className="h-11 px-4 text-sm"
            {...register("name")}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={!!errors.email}
            className="h-11 px-4 text-sm"
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={!!errors.password}
            className="h-11 px-4 text-sm"
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={!!errors.confirmPassword}
            className="h-11 px-4 text-sm"
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-sm font-medium"
          loading={submitting}
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}