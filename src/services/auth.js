import crypto from 'crypto';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

function makeToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export async function createSession(userId) {
  const now = Date.now();
  const accessToken  = makeToken(32);
  const refreshToken = makeToken(48);

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + ONE_DAY),
  });

  return session;
}

export function setSessionCookies(res, session) {
  const common = { httpOnly: true, secure: true, sameSite: 'none' };

  res.cookie('accessToken', session.accessToken, { ...common, maxAge: FIFTEEN_MINUTES });
  res.cookie('refreshToken', session.refreshToken, { ...common, maxAge: ONE_DAY });
  res.cookie('sessionId', String(session._id), { ...common, maxAge: ONE_DAY });
}
