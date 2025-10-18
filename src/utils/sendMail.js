import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
  console.warn('[sendMail] Missing SMTP env vars — check .env');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false, // 587 — STARTTLS
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

export async function sendEmail({ to, subject, html }) {
  const info = try { await transporter.sendMail({ from: SMTP_FROM, to, subject, html }); } catch (e) { console.error('[sendMail error]', e?.message); throw e; }
  return info;
}

export async function verifySmtp(){ try{ await transporter.verify(); return { ok:true }; } catch(e){ console.error("[SMTP verify]", e?.message); return { ok:false, error:e?.message }; }}
