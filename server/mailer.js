// ========================================
// Email sender (nodemailer)
// ----------------------------------------
// Sends a confirmation email when a complaint is submitted. Configured via
// EMAIL_USER + EMAIL_PASS env vars (Gmail App Password recommended). If those
// aren't set, sending is skipped gracefully — the app still works, it just
// won't email. Sending is fire-and-forget so it never blocks/breaks the API.
// ========================================
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null; // not configured
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

async function sendComplaintConfirmation(to, name, complaint) {
  const t = getTransporter();
  if (!t) {
    console.log("ℹ️  Email not configured (EMAIL_USER/EMAIL_PASS) — skipping.");
    return;
  }
  if (!to) {
    console.log("ℹ️  No recipient email on this account — skipping.");
    return;
  }

  const idShort = String(complaint._id || complaint.id || "").slice(-6);
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#6d28d9">Complaint submitted ✅</h2>
      <p>Hi ${name || "Citizen"},</p>
      <p>Your complaint has been <strong>successfully submitted</strong> to the
      Pachtaki Yadu Gram Panchayat portal. Our team will review it shortly.</p>
      <table style="border-collapse:collapse;margin:16px 0;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Reference</td><td><strong>#${idShort}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Category</td><td>${complaint.category || ""}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Ward</td><td>${complaint.wardNumber || ""}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Status</td><td>${complaint.status || "Pending"}</td></tr>
      </table>
      <p style="color:#444">Issue: ${complaint.issue || ""}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="font-size:12px;color:#999">Pachtaki Yadu Digital Citizen Portal</p>
    </div>`;

  await t.sendMail({
    from: `"Pachtaki Yadu Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✅ Your complaint was submitted successfully",
    html,
  });
  console.log(`📧 Confirmation email sent to ${to}`);
}

module.exports = { sendComplaintConfirmation };
