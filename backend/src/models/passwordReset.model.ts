import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

export interface IPasswordReset {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>({
  email: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Automatically delete expired reset tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.PasswordReset || model<IPasswordReset>("PasswordReset", passwordResetSchema);
