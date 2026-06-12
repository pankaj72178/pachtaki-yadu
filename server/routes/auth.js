const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Emails that should get the "admin" role (comma-separated in ADMIN_EMAILS).
function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Role is decided by the server (whitelist) — never by the client.
function roleFor(email) {
  return adminEmails().includes(email.toLowerCase()) ? "admin" : "citizen";
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------------------------------------------------------------------
// POST /api/auth/register  — email/password sign up.
// The role (citizen vs admin) is decided server-side from ADMIN_EMAILS, so a
// user can't make themselves admin just by asking.
// ---------------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const lower = email.toLowerCase();
    const existing = await User.findOne({ email: lower });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: lower,
      passwordHash,
      role: roleFor(lower),
    });

    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Could not register" });
  }
});

// ---------------------------------------------------------------------
// POST /api/auth/login  — email/password sign in.
// ---------------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      // Same message whether the user doesn't exist or has no password
      // (e.g. a Google-only account) — don't leak which.
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Keep role in sync with the admin whitelist on each login.
    const role = roleFor(user.email);
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ token: signToken(user), user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Could not log in" });
  }
});

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
