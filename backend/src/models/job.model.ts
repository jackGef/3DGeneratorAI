import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export interface IJob {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  chatId?: Types.ObjectId | null;
  prompt: string;
  params: Record<string, any>;
  status: JobStatus;
  progress: number;
  error?: any | null;
  outputs: string[];            // assetIds
  computeMs?: number;
  costCredits?: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  finishedAt?: Date | null;
}

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", default: null, index: true },
    prompt: { type: String, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["queued", "running", "succeeded", "failed", "canceled"], index: true, default: "queued" },
    progress: { type: Number, default: 0 },
    error: { type: Schema.Types.Mixed, default: null },
    outputs: { type: [String], default: [] },
    computeMs: Number,
    costCredits: Number,
    startedAt: Date,
    finishedAt: Date,
  },
  { timestamps: true }
);

JobSchema.index({ userId: 1, createdAt: -1 });

export default models.Job || model<IJob>("Job", JobSchema);
