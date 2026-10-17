import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM =
  process.env.EMAIL_FROM ?? "Nova Analytics <onboarding@resend.dev>";

export async function sendVerificationEmail(
  to: string,
  name: string | null,
  url: string
) {
  // In dev with no API key, log the link so you can still test
  if (!resend) {
    console.log("\n📧 [mail:dev] Verification link for", to);
    console.log("   " + url + "\n");
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your Nova Analytics email",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">Verify your email</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>Click the button below to verify your Nova Analytics account. This link expires in 24 hours.</p>
        <p style="margin:24px 0">
          <a href="${url}"
             style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
            Verify email
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">
          If you didn't create this account, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  url: string
) {
  if (!resend) {
    console.log("\n📧 [mail:dev] Password reset link for", to);
    console.log("   " + url + "\n");
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Nova Analytics password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
        <p style="margin:24px 0">
          <a href="${url}"
             style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
            Reset password
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}