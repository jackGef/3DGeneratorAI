import mongoose, { Schema } from 'mongoose';

const AssetSchema = new Schema({
  _id: { type: String, required: true },
  prompt: { type: String, required: true },
  files: {
    glb: String,
    obj: String,
    mtl: String,
    ply: String
  }
}, { timestamps: true, _id: false });

export const AssetModel = mongoose.model('Asset', AssetSchema);