import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageType = "text" | "image" | "file" | "event";

export interface IMessage {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  role: MessageRole;
  type: MessageType;
  content: string;
  attachments?: { assetId: string; kind: string; url: string }[];
  toolCalls?: unknown[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, enum: ["user", "assistant", "system", "tool"], required: true },
    type: { type: String, enum: ["text", "image", "file", "event"], default: "text" },
    content: { type: String, default: "" },
    attachments: [{ assetId: String, kind: String, url: String }],
    toolCalls: { type: Array, default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ chatId: 1, createdAt: 1 });

export default models.Message || model<IMessage>("Message", MessageSchema);
