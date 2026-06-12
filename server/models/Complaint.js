const mongoose = require("mongoose");

// A citizen complaint/report. Each belongs to the user who filed it (`user`),
// so citizens see only their own while admins can see/manage all.
const complaintSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    wardNumber: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    issue: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    notes: [
      {
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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

module.exports =
  mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
