import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const path = nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && ["/login", "/register"].includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard
  if (path.startsWith("/dashboard") && !isLoggedIn) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Admin-only routes
  if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|track.js).*)"],
};