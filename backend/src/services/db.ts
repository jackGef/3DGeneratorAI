import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export async function connectDB(uri:string = process.env.MONGODB_URI!) {
    if (!uri) throw new Error("MongoDB URI is not defined");
    try {
        mongoose.set("strictQuery", true);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export function disconnectDB() {
    mongoose.disconnect()
        .then(() => console.log("Disconnected from MongoDB"))
        .catch((error) => console.error("Error disconnecting from MongoDB:", error));
}