import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    email:    { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre('save', function(next) {
  if (this.isNew && !this.username) this.username = this.email;
  next();
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
