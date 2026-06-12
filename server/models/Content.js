const mongoose = require("mongoose");

// Generic content item for the village portal's info sections. One model
// powers Government Services, Village Events, Agriculture Support, Job
// Opportunities, and Budget & Expenditure — distinguished by `section`.
const SECTIONS = [
  "notices",
  "services",
  "events",
  "agriculture",
  "jobs",
  "budget",
];

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, enum: SECTIONS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    // Flexible extra line: a date for events, salary for jobs, amount for
    // budget, eligibility for agriculture, etc. Shown as a small badge.
    meta: { type: String, default: "", trim: true },
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

module.exports = {
  Content: mongoose.models.Content || mongoose.model("Content", contentSchema),
  SECTIONS,
};
