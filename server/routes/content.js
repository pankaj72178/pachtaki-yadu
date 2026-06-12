const express = require("express");
const mongoose = require("mongoose");
const { Content, SECTIONS } = require("../models/Content");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/content/:section — PUBLIC. Anyone can view a section's items.
router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;
    if (!SECTIONS.includes(section)) {
      return res.status(404).json({ error: "Unknown section" });
    }
    const items = await Content.find({ section }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("List content error:", err);
    res.status(500).json({ error: "Failed to load content" });
  }
});

// Everything below requires admin.
router.use(auth, adminOnly);

function validItem(body) {
  const { section, title } = body || {};
  if (!SECTIONS.includes(section)) return "Invalid section";
  if (!title || !String(title).trim()) return "Title is required";
  return null;
}

// POST /api/content — ADMIN: add an item to a section.
router.post("/", async (req, res) => {
  try {
    const err = validItem(req.body);
    if (err) return res.status(400).json({ error: err });
    const { section, title, description, meta } = req.body;
    const item = await Content.create({
      section,
      title: title.trim(),
      description: (description || "").trim(),
      meta: (meta || "").trim(),
    });
    res.status(201).json({ success: true, item });
  } catch (e) {
    console.error("Create content error:", e);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// PUT /api/content/:id — ADMIN: edit an item.
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Item not found" });
    }
    const { title, description, meta } = req.body || {};
    const updates = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (meta !== undefined) updates.meta = String(meta).trim();

    const item = await Content.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, item });
  } catch (e) {
    console.error("Update content error:", e);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/content/:id — ADMIN: remove an item.
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Item not found" });
    }
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, message: "Item deleted" });
  } catch (e) {
    console.error("Delete content error:", e);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;
