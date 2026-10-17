import { Resend } from 'resend';
import { logger } from '../utils/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: "Verify your Nova Analytics email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Nova Analytics!</h2>
          <p>Click the button below to verify your email address:</p>
          <p>
            <a href="${verifyUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Verify Email
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy this URL:<br>
            <code>${verifyUrl}</code>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    logger.info(`[email] Verification sent to ${to}: ${result.data?.id}`);
    return result;
  } catch (err) {
    logger.error(`[email] Verification failed for ${to}:`, err);
    throw err;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: 'Reset your Nova Analytics password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Click the link below to reset your Nova Analytics password:</p>
          <p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy this URL: <br>
            <code>${resetUrl}</code>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    logger.info(`[email] Password reset sent to ${to}: ${result.data?.id}`);
    return result;
  } catch (err) {
    logger.error(`[email] Failed to send to ${to}:`, err);
    throw err;
  }



}