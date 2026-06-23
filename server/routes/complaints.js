const express = require("express");
const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const { auth, adminOnly } = require("../middleware/auth");
const { sendComplaintConfirmation } = require("../mailer");

const router = express.Router();

// ---------------------------------------------------------------------
// GET /api/complaints/public  (NO AUTH — anyone can see)
// Returns every complaint but WITHOUT any citizen identity: no fullName,
// no user, no internal notes. So the community can see issues + their status
// while the person who filed each one stays private.
// Defined BEFORE the auth gate below so it stays public.
// ---------------------------------------------------------------------
router.get("/public", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .select(
        "wardNumber category severity issue photoUrl status location statusHistory createdAt"
      );
    res.json(complaints);
  } catch (err) {
    console.error("Public complaints error:", err);
    res.status(500).json({ error: "Failed to load complaints" });
  }
});

// Everything BELOW here requires a logged-in user.
router.use(auth);

// POST /api/complaints — a citizen files a complaint (tied to their account).
router.post("/", async (req, res) => {
  try {
    const { fullName, wardNumber, category, severity, issue, photoUrl, location } =
      req.body || {};

    if (!fullName || !wardNumber || !category || !issue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Keep only valid numeric coordinates (ignore anything else).
    let loc = { lat: null, lng: null };
    if (
      location &&
      Number.isFinite(Number(location.lat)) &&
      Number.isFinite(Number(location.lng))
    ) {
      loc = { lat: Number(location.lat), lng: Number(location.lng) };
    }

    const complaint = await Complaint.create({
      fullName,
      wardNumber,
      category,
      severity: severity || "Medium",
      issue,
      photoUrl: photoUrl || null,
      location: loc,
      // Seed the timeline with the initial "Pending" state.
      statusHistory: [{ status: "Pending", at: new Date() }],
      user: req.userId,
    });

    // Email the citizen a confirmation (fire-and-forget — never blocks/fails
    // the response if email isn't configured or the send errors).
    sendComplaintConfirmation(req.userEmail, req.userName, complaint).catch(
      (e) => console.error("Email send failed:", e.message)
    );

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ error: "Failed to create complaint" });
  }
});

// GET /api/complaints/mine — the logged-in citizen's own complaints.
router.get("/mine", async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    console.error("List my complaints error:", err);
    res.status(500).json({ error: "Failed to load complaints" });
  }
});

// GET /api/complaints — ADMIN ONLY: every complaint from every citizen.
router.get("/", adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(complaints);
  } catch (err) {
    console.error("List all complaints error:", err);
    res.status(500).json({ error: "Failed to load complaints" });
  }
});

// PUT /api/complaints/:id — ADMIN ONLY: change ANYTHING about a complaint
// (status, category, ward, severity, issue) and/or add a note.
const STATUSES = ["Pending", "Ongoing", "Completed"];

router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { status, category, wardNumber, severity, issue, note } =
      req.body || {};

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    if (status && !STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be Pending, Ongoing, or Completed" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Apply only the fields that were provided.
    if (status && status !== complaint.status) {
      complaint.status = status;
      // Record the transition in the timeline.
      complaint.statusHistory.push({ status, at: new Date(), note: note || "" });
    }
    if (category) complaint.category = category;
    if (wardNumber) complaint.wardNumber = wardNumber;
    if (severity) complaint.severity = severity;
    if (issue) complaint.issue = issue;
    if (note) complaint.notes.push({ text: note });

    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    console.error("Update complaint error:", err);
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

// DELETE /api/complaints/:id — ADMIN ONLY: permanently remove a complaint.
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    console.error("Delete complaint error:", err);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

module.exports = router;
