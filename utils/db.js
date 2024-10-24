import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const connectDB = async () => {
    try {
        const url = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database is connected ${url.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
} 