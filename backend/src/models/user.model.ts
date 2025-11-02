import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    emailVerified: boolean;
    password: string;
    userName: string;
    roles: string[];
    profile: { avatarUrl?: string; bio?: string };
    settings: {
        theme?: "light" | "dark";
        language?: string;
        notifications?: { jobFinished: boolean };
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {type: String, required: true, unique: true, index: true },
        emailVerified: { type: Boolean, default: false },
        password: { type: String, required: true },
        userName: { type: String, required: true },
        roles: { type: [String], default: ['user'], index: true },
        profile: {
            avatarUrl: String,
            bio: String
        },
        settings: {
            theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
            language: { type: String, default: 'en' },
            notifications: {
                jobFinished: { type: Boolean, default: true }
            }
        }
    },
    { timestamps: true }
)

export default models.User || model<IUser>('User', UserSchema);