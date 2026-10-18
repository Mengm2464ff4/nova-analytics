import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth.schema";
import { api, ApiClientError } from "@/lib/api";
import type { AppUser } from "@/types/auth";

interface BackendLoginResponse {
  user: AppUser;
  accessToken: string;
  refreshToken?: string;
}

export const authConfig = {
  trustHost: true, // 👈 ADD THIS LINE HERE
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        try {
          const data = await api.post<BackendLoginResponse>(
            "/auth/login",
            parsed.data
          );
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? undefined,
            image: data.user.image ?? undefined,
            role: data.user.role,
            accessToken: data.accessToken,
          } as any;
        } catch (err) {
          if (err instanceof ApiClientError) {
            throw new Error(
              err.code === "EMAIL_NOT_VERIFIED"
                ? "EMAIL_NOT_VERIFIED"
                : "CredentialsSignin"
            );
          }
          throw new Error("CredentialsSignin");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
        }
      }

      // Handle Google AND GitHub sign-ins the same way:
      // create/update the user on the Express backend and grab a JWT.
      if (
        (account?.provider === "google" || account?.provider === "github") &&
        user?.email
      ) {
        try {
          const data = await api.post<BackendLoginResponse>(
            "/auth/oauth/google",
            {
              email: user.email,
              name: user.name,
              image: user.image,
              providerAccountId: account.providerAccountId,
            }
          );
          token.id = data.user.id;
          token.role = data.user.role;
          token.accessToken = data.accessToken;
        } catch (err) {
          console.error(`[auth.config] ${account.provider} oauth failed:`, err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) ?? "USER";
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;