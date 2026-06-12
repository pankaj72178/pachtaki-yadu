const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Emails that should get the "admin" role (comma-separated in ADMIN_EMAILS).
function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------------------------------------------------------------------
// POST /api/auth/google
// Verify the Google ID token (credential) from the frontend's Sign-in button,
// find-or-create the user, assign admin role if their email is in ADMIN_EMAILS,
// then issue our own app JWT.
// ---------------------------------------------------------------------
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ error: "Google sign-in is not configured on the server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { sub, email, name, ... }
    const email = payload.email && payload.email.toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Google account has no email" });
    }

    const role = adminEmails().includes(email) ? "admin" : "citizen";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || email,
        email,
        googleId: payload.sub,
        role,
      });
    } else {
      // Keep googleId + role in sync (e.g. admin list changed).
      let changed = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        changed = true;
      }
      if (user.role !== role) {
        user.role = role;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = signToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Google sign-in failed" });
  }
});

module.exports = router;
