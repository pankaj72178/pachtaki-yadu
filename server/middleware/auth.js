const jwt = require("jsonwebtoken");

// Verifies the "Authorization: Bearer <token>" header, attaches the user id +
// role to the request. Returns 401 on any failure (never throws/crashes).
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.userRole = payload.role || "citizen";
    req.userEmail = payload.email || null;
    req.userName = payload.name || null;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Must run AFTER auth. Allows only admins through.
function adminOnly(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { auth, adminOnly };
