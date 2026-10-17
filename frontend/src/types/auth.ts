export type Role = "USER" | "ADMIN";

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  emailVerified?: Date | string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}