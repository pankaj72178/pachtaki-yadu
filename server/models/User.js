const mongoose = require("mongoose");

// Citizens and admins. Login is via Google only (no passwords). `role` is
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
    role: { type: String, enum: ["citizen", "admin"], default: "citizen" },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
