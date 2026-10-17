import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service";

const router = Router();

// ---------- Helpers ----------
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signAccessToken(userId: string, role: string) {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
}

// ---------- Schemas ----------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email(),
  password: z.string().min(8),
});

const oauthSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  providerAccountId: z.string(),
});

// ---------- POST /api/auth/login ----------
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN ROUTE CALLED");
  console.log("📦 BODY:", req.body);

  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("❌ PARSE FAILED");
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = normalizeEmail(email);
    console.log("🔍 Looking up:", normalizedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    console.log("👤 User found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("🔑 Has password:", !!user.passwordHash);
    console.log("🖼️ Image:", user.image);

    // Google user without password
    if (!user.passwordHash) {
      const hasGoogleImage = user.image?.includes("googleusercontent.com");
      
      if (hasGoogleImage) {
        console.log("🚀 USE_GOOGLE_LOGIN");
        return res.status(401).json({
          message: "This account uses Google sign-in.",
          code: "USE_GOOGLE_LOGIN",
        });
      }
      
      return res.status(401).json({ message: "No password set" });
    }

    // Email not verified
    if (!user.emailVerified) {
      console.log("📧 EMAIL_NOT_VERIFIED");
      return res.status(401).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email first.",
      });
    }

    // Check password
    console.log("🔐 Comparing password...");
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("✅ Password valid:", ok);

    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
    const accessToken = signAccessToken(safeUser.id, safeUser.role);

    console.log("✅ LOGIN SUCCESS");
    return res.json({ user: safeUser, accessToken });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/register ----------
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { name, password } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        // emailVerified: new Date(),  // ← Auto-verify
      },
      select: { id: true, email: true, name: true, image: true, role: true },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(email, verifyUrl);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Email send failed:", emailErr);
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.error("[auth/register]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/oauth/google ----------
router.post("/oauth/google", async (req, res) => {
  try {
    const parsed = oauthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email, name, image } = parsed.data;
    const normalizedEmail = normalizeEmail(email);  
     // Generate a random placeholder password for Google users
    // so they can also use "Forgot password" later if they want.
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);


    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: name ?? undefined,
        image: image ?? undefined,
        emailVerified: new Date(),
        // ⚠️ Only set on CREATE, not on UPDATE — otherwise existing
    // users who already have a real password would get overwritten.
      },
      create: {
        email: normalizedEmail,
        name: name ?? undefined,
        image: image ?? undefined,
        role: "USER",
        emailVerified: new Date(),
        passwordHash,   // ← NEW: random hash so the account has a password
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    const accessToken = signAccessToken(user.id, user.role);

    return res.json({ user, accessToken });
  } catch (err) {
    console.error("[auth/oauth/google]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/forgot-password ----------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ message: "Missing email" });

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email: normalizedEmail, token, expires },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      console.log("🔗 RESET URL:", resetUrl);

      try {
        await sendPasswordResetEmail(normalizedEmail, resetUrl);
      } catch (emailErr) {
        console.error("[auth/forgot-password] Email send failed:", emailErr);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/reset-password ----------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { token } }),
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/verify-email ----------
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body ?? {};
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (record.expires < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/verify-email]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- POST /api/auth/resend-verification ----------
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.json({ ok: true });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(normalizedEmail, verifyUrl);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/resend-verification]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;