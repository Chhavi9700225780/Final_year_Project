
import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  // Reuse an existing connection.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Reuse an ongoing connection attempt.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(({ connection }) => {
        console.log(`MongoDB Connected: ${connection.host}`);
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB Connection Error:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
