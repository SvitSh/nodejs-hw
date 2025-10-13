import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    accessToken: { type: String, required: true, index: true },
    refreshToken: { type: String, required: true, index: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
