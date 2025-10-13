import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export async function authenticate(req, _res, next) {
  try {
    const { accessToken } = req.cookies || {};
    if (!accessToken) return next(createHttpError(401, 'Missing access token'));

    const session = await Session.findOne({ accessToken });
    if (!session) return next(createHttpError(401, 'Session not found'));

    if (Date.now() > session.accessTokenValidUntil.getTime()) {
      await Session.deleteOne({ _id: session._id });
      return next(createHttpError(401, 'Access token expired'));
    }

    const user = await User.findById(session.userId);
    if (!user) return next(createHttpError(401));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
