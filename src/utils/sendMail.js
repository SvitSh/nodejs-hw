import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
  console.warn('[sendMail] Missing SMTP env vars — check .env / Render env');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false, // 465=true, 587=false (STARTTLS)
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
    return info;
  } catch (e) {
    // лог в Render, чтобы видеть причину
    console.error('[sendMail error]', e?.message);
    throw e;
  }
}

export async function verifySmtp() {
  try {
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    console.error('[SMTP verify]', e?.message);
    return { ok: false, error: e?.message };
  }
}
