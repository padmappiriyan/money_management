import mongoose from "mongoose";


// Global cache (for serverless environments )
const globalCache = globalThis;

if (!globalCache.mongoose) {
  globalCache.mongoose = {
    conn: null,
    promise: null,
  };
}

const cached = globalCache.mongoose;

const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", MONGO_URI);

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

// Connection options
const options = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  autoIndex: process.env.NODE_ENV !== "production",
};

const connectDB = async () => {
  // If already connected → reuse
  
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress → wait
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, options)
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null; // reset on failure
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.conn = null;
    throw error;
  }

  return cached.conn;
};

// Event Handlers (defined once)
mongoose.connection.on("connected", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("MongoDB connected Successfully");
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
  cached.conn = null;
  cached.promise = null;
});

// Utility function
export const getConnectionStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  return {
    isConnected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
  };
};

export default connectDB;