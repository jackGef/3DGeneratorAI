import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IAsset {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobId?: Types.ObjectId | null;
  kind: "model" | "image" | "log" | "zip";
  format?: string; // e.g. glb, png
  bytes?: number;
  url: string;     // S3/GridFS URL or pointer
  thumbnailUrl?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true, default: null },
    kind: { type: String, enum: ["model", "image", "log", "zip"], required: true },
    format: String,
    bytes: Number,
    url: { type: String, required: true, index: true },
    thumbnailUrl: String,
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Asset || model<IAsset>("Asset", AssetSchema);
