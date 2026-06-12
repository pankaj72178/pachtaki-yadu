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
      .select("wardNumber category severity issue photoUrl status createdAt");
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
    const { fullName, wardNumber, category, severity, issue, photoUrl } =
      req.body || {};

    if (!fullName || !wardNumber || !category || !issue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const complaint = await Complaint.create({
      fullName,
      wardNumber,
      category,
      severity: severity || "Medium",
      issue,
      photoUrl: photoUrl || null,
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

// PUT /api/complaints/:id — ADMIN ONLY: change status / add a note.
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (note) complaint.notes.push({ text: note });
    await complaint.save();

    res.json({ success: true, complaint });
  } catch (err) {
    console.error("Update complaint error:", err);
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

module.exports = router;
