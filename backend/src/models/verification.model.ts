import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

export interface IVerification {
  email: string;
  userName: string;
  passwordHash: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const verificationSchema = new Schema<IVerification>({
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
})

export default models.Verification || model<IVerification>("Verification", verificationSchema)