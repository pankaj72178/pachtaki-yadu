const mongoose = require("mongoose");

// Citizens and admins. Login is via Google OR email/password. `role` is
// "admin" for emails listed in ADMIN_EMAILS, otherwise "citizen".
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: { type: String },
    // Only set for email/password accounts (Google users have none).
    passwordHash: { type: String },
    role: { type: String, enum: ["citizen", "admin"], default: "citizen" },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash; // never expose the hash
      },
    },
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
