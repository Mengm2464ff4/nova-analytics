import "server-only";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Nova Analytics <noreply@localhost>";

  if (!apiKey) {
    // Dev fallback — just log.
    console.log("[mail:dev]", { to, subject, html });
    return { ok: true, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  return res.json();
}

export function verificationEmailTemplate(name: string, url: string) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px">
    <h2 style="margin:0 0 12px">Verify your Nova Analytics email</h2>
    <p>Hi ${name || "there"},</p>
    <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
    <p style="margin:24px 0">
      <a href="${url}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Verify email</a>
    </p>
    <p style="color:#6b7280;font-size:13px">If you didn't create this account, ignore this email.</p>
  </div>`;
}

export function resetPasswordEmailTemplate(name: string, url: string) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px">
    <h2 style="margin:0 0 12px">Reset your Nova Analytics password</h2>
    <p>Hi ${name || "there"},</p>
    <p>Click below to choose a new password. This link expires in 1 hour.</p>
    <p style="margin:24px 0">
      <a href="${url}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset password</a>
    </p>
    <p style="color:#6b7280;font-size:13px">If you didn't request this, ignore this email.</p>
  </div>`;
}