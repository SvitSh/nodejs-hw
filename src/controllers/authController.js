import { sendEmail } from '../utils/sendMail.js';

import path from 'node:path';

import fs from 'node:fs/promises';

import Handlebars from 'handlebars';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

export async function registerUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const exists = await User.findOne({ email }).lean();
    if (exists) return next(createHttpError(400, 'Email in use'));

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(401, 'User not found'));

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return next(createHttpError(401, 'Invalid credentials'));

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function refreshUserSession(req, res, next) {
  try {
    const { sessionId, refreshToken } = req.cookies || {};
    if (!sessionId || !refreshToken) return next(createHttpError(401, 'Session not found'));

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) return next(createHttpError(401, 'Session not found'));

    if (Date.now() > session.refreshTokenValidUntil.getTime()) {
      await Session.deleteOne({ _id: session._id });
      return next(createHttpError(401, 'Session token expired'));
    }

    const userId = session.userId;
    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
}

export async function logoutUser(req, res, next) {
  try {
    const { sessionId } = req.cookies || {};
    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    const opts = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('accessToken', opts);
    res.clearCookie('refreshToken', opts);
    res.clearCookie('sessionId', opts);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/* === password reset flow === */
const TEMPLATES_DIR = path.resolve('src', 'templates');
const RESET_TEMPLATE = path.join(TEMPLATES_DIR, 'reset-password-email.html');

export async function requestResetEmail(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) return next(createHttpError(404, 'User not found'));

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const frontend = process.env.FRONTEND_DOMAIN;
    const resetLink = `${frontend.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    const templateSrc = await fs.readFile(RESET_TEMPLATE, 'utf-8');
    const compile = Handlebars.compile(templateSrc);
    const html = compile({ username: user.username || user.email, resetLink });

    try {
      await sendEmail({ to: user.email, subject: 'Password reset', html });
    } catch {
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    res.json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const user = await User.findOne({ _id: payload.sub, email: payload.email });
    if (!user) return next(createHttpError(404, 'User not found'));

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}
