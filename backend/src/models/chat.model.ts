import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

export interface IModelData {
  modelId: string;
  glbUrl: string;
  objUrl: string;
  plyUrl: string;
  mtlUrl: string;
}

export interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | '3d-model';
  modelData?: IModelData;
}

export interface IChat {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['text', '3d-model'], default: 'text' },
  modelData: {
    type: {
      modelId: String,
      glbUrl: String,
      objUrl: String,
      plyUrl: String,
      mtlUrl: String
    },
    required: false
  }
}, { _id: false });

const chatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 30 },
  messages: [messageSchema],
  isPinned: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient user chat queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

// Virtual for getting the last message
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Virtual for getting preview text
chatSchema.virtual('preview').get(function() {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
  }
  return '';
});

const Chat = models.Chat || model<IChat>("Chat", chatSchema);

export default Chat;