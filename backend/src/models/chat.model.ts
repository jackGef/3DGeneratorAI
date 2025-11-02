import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IChat {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  lastMessageAt: Date | null;
  messageCount: number;
  pinned: boolean;
  archived: boolean;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, required: true },
    lastMessageAt: { type: Date, default: null, index: true },
    messageCount: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    preview: String,
  },
  { timestamps: true }
);

ChatSchema.index({ userId: 1, lastMessageAt: -1 });

export default models.Chat || model<IChat>("Chat", ChatSchema);
