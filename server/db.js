// Cached Mongoose connection (works for a normal server and serverless alike).
const mongoose = require("mongoose");

let cached = global._pachtakiMongoose;
if (!cached) cached = global._pachtakiMongoose = { conn: null, promise: null };

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
