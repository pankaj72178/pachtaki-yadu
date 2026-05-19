const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(__dirname));

// ==================== DATA FILES ====================

const complaintsFile = path.join(__dirname, "data", "complaints.json");
const noticesFile = path.join(__dirname, "data", "notices.json");
const servicesFile = path.join(__dirname, "data", "services.json");
const eventsFile = path.join(__dirname, "data", "events.json");
const budgetFile = path.join(__dirname, "data", "budget.json");
const suggestionsFile = path.join(__dirname, "data", "suggestions.json");
const jobsFile = path.join(__dirname, "data", "jobs.json");
const agricultureFile = path.join(__dirname, "data", "agriculture.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}

// Initialize all data files
const initializeFiles = () => {
  [complaintsFile, noticesFile, servicesFile, eventsFile, budgetFile, suggestionsFile, jobsFile, agricultureFile].forEach(file => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([]), "utf8");
    }
  });
};
initializeFiles();

// ==================== COMPLAINTS ====================

app.get("/api/complaints", (req, res) => {
  try {
    const data = fs.readFileSync(complaintsFile, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

app.post("/api/complaints", (req, res) => {
  try {
    const { fullName, wardNumber, category, severity, issue, photo } = req.body;
    if (!fullName || !wardNumber || !category || !issue) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }
    const data = fs.readFileSync(complaintsFile, "utf8");
    const complaints = JSON.parse(data);
    const newComplaint = {
      id: Date.now(),
      fullName, wardNumber, category, severity: severity || "Medium",
      issue, photo: photo || null, status: "Pending", notes: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    complaints.push(newComplaint);
    fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2), "utf8");
    console.log("✓ Complaint received from:", fullName, "- Category:", category);
    res.status(201).json({ success: true, message: "Complaint submitted successfully!", complaint: newComplaint });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

app.put("/api/complaints/:id", (req, res) => {
  try {
    const { status, note } = req.body;
    const data = fs.readFileSync(complaintsFile, "utf8");
    const complaints = JSON.parse(data);
    const complaint = complaints.find(c => c.id === parseInt(req.params.id));
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    complaint.status = status || complaint.status;
    complaint.updatedAt = new Date().toISOString();
    if (note) {
      complaint.notes = complaint.notes || [];
      complaint.notes.push({ text: note, timestamp: new Date().toISOString() });
    }
    fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2), "utf8");
    res.json({ success: true, message: "Complaint updated", complaint });
  } catch (error) {
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

// ==================== NOTICES ====================

app.get("/api/notices", (req, res) => {
  try {
    const data = fs.readFileSync(noticesFile, "utf8");
    res.json(JSON.parse(data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

app.post("/api/notices", (req, res) => {
  try {
    const { title, content, category, isPinned } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });
    const data = fs.readFileSync(noticesFile, "utf8");
    const notices = JSON.parse(data);
    const newNotice = {
      id: Date.now(), title, content, category: category || "General",
      isPinned: isPinned || false, createdAt: new Date().toISOString(),
    };
    notices.push(newNotice);
    fs.writeFileSync(noticesFile, JSON.stringify(notices, null, 2), "utf8");
    res.status(201).json({ success: true, notice: newNotice });
  } catch (error) {
    res.status(500).json({ error: "Failed to create notice" });
  }
});

// ==================== SERVICES ====================

app.get("/api/services", (req, res) => {
  try {
    const data = fs.readFileSync(servicesFile, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

app.post("/api/services", (req, res) => {
  try {
    const { name, type, contact, address, hours } = req.body;
    if (!name || !type) return res.status(400).json({ error: "Name and type required" });
    const data = fs.readFileSync(servicesFile, "utf8");
    const services = JSON.parse(data);
    const newService = { id: Date.now(), name, type, contact, address, hours, createdAt: new Date().toISOString() };
    services.push(newService);
    fs.writeFileSync(servicesFile, JSON.stringify(services, null, 2), "utf8");
    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    res.status(500).json({ error: "Failed to create service" });
  }
});

// ==================== EVENTS ====================

app.get("/api/events", (req, res) => {
  try {
    const data = fs.readFileSync(eventsFile, "utf8");
    res.json(JSON.parse(data).sort((a, b) => new Date(a.date) - new Date(b.date)));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/api/events", (req, res) => {
  try {
    const { title, date, description, location } = req.body;
    if (!title || !date) return res.status(400).json({ error: "Title and date required" });
    const data = fs.readFileSync(eventsFile, "utf8");
    const events = JSON.parse(data);
    const newEvent = { id: Date.now(), title, date, description, location, rsvp: 0, createdAt: new Date().toISOString() };
    events.push(newEvent);
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2), "utf8");
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

// ==================== BUDGET ====================

app.get("/api/budget", (req, res) => {
  try {
    const data = fs.readFileSync(budgetFile, "utf8");
    const budgets = JSON.parse(data);
    const summary = {
      total: budgets.reduce((sum, b) => sum + (b.allocated || 0), 0),
      spent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
      projects: budgets,
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

app.post("/api/budget", (req, res) => {
  try {
    const { projectName, allocated, spent, category } = req.body;
    if (!projectName || !allocated) return res.status(400).json({ error: "Project name and allocated amount required" });
    const data = fs.readFileSync(budgetFile, "utf8");
    const budgets = JSON.parse(data);
    const newBudget = { id: Date.now(), projectName, allocated, spent: spent || 0, category: category || "Infrastructure", createdAt: new Date().toISOString() };
    budgets.push(newBudget);
    fs.writeFileSync(budgetFile, JSON.stringify(budgets, null, 2), "utf8");
    res.status(201).json({ success: true, budget: newBudget });
  } catch (error) {
    res.status(500).json({ error: "Failed to create budget entry" });
  }
});

// ==================== SUGGESTIONS ====================

app.get("/api/suggestions", (req, res) => {
  try {
    const data = fs.readFileSync(suggestionsFile, "utf8");
    res.json(JSON.parse(data).sort((a, b) => b.votes - a.votes));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

app.post("/api/suggestions", (req, res) => {
  try {
    const { title, description, anonymous } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });
    const data = fs.readFileSync(suggestionsFile, "utf8");
    const suggestions = JSON.parse(data);
    const newSuggestion = { id: Date.now(), title, description, anonymous: anonymous || true, votes: 0, createdAt: new Date().toISOString() };
    suggestions.push(newSuggestion);
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2), "utf8");
    res.status(201).json({ success: true, suggestion: newSuggestion });
  } catch (error) {
    res.status(500).json({ error: "Failed to create suggestion" });
  }
});

app.put("/api/suggestions/:id/vote", (req, res) => {
  try {
    const data = fs.readFileSync(suggestionsFile, "utf8");
    const suggestions = JSON.parse(data);
    const suggestion = suggestions.find(s => s.id === parseInt(req.params.id));
    if (!suggestion) return res.status(404).json({ error: "Suggestion not found" });
    suggestion.votes = (suggestion.votes || 0) + 1;
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2), "utf8");
    res.json({ success: true, votes: suggestion.votes });
  } catch (error) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

// ==================== JOBS ====================

app.get("/api/jobs", (req, res) => {
  try {
    const data = fs.readFileSync(jobsFile, "utf8");
    res.json(JSON.parse(data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.post("/api/jobs", (req, res) => {
  try {
    const { title, description, location, type } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    const data = fs.readFileSync(jobsFile, "utf8");
    const jobs = JSON.parse(data);
    const newJob = { id: Date.now(), title, description, location: location || "Bairgania", type: type || "Self-Employment", createdAt: new Date().toISOString() };
    jobs.push(newJob);
    fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), "utf8");
    res.status(201).json({ success: true, job: newJob });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job posting" });
  }
});

// ==================== AGRICULTURE ====================

app.get("/api/agriculture", (req, res) => {
  try {
    const data = fs.readFileSync(agricultureFile, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agriculture data" });
  }
});

app.post("/api/agriculture", (req, res) => {
  try {
    const { title, category, content, link } = req.body;
    if (!title || !category) return res.status(400).json({ error: "Title and category required" });
    const data = fs.readFileSync(agricultureFile, "utf8");
    const agriculture = JSON.parse(data);
    const newItem = { id: Date.now(), title, category, content, link, createdAt: new Date().toISOString() };
    agriculture.push(newItem);
    fs.writeFileSync(agricultureFile, JSON.stringify(agriculture, null, 2), "utf8");
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to create agriculture entry" });
  }
});

// ==================== STATISTICS ====================

app.get("/api/statistics", (req, res) => {
  try {
    const complaints = JSON.parse(fs.readFileSync(complaintsFile, "utf8"));
    const notices = JSON.parse(fs.readFileSync(noticesFile, "utf8"));
    const events = JSON.parse(fs.readFileSync(eventsFile, "utf8"));
    const suggestions = JSON.parse(fs.readFileSync(suggestionsFile, "utf8"));
    
    res.json({
      complaints: {
        total: complaints.length,
        pending: complaints.filter(c => c.status === "Pending").length,
        resolved: complaints.filter(c => c.status === "Resolved").length,
        rate: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === "Resolved").length / complaints.length) * 100) : 0,
      },
      notices: notices.length,
      events: events.length,
      suggestions: suggestions.length,
      topSuggestions: suggestions.sort((a, b) => b.votes - a.votes).slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
  res.json({
    status: "✓ Pachtaki Yadu Portal is running!",
    version: "3.0 - Enhanced Village Portal",
    features: ["Complaints", "Notices", "Services", "Events", "Budget", "Suggestions", "Jobs", "Agriculture"],
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, HOST, () => {
  // Get all local IP addresses
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════╗
║   Pachtaki Yadu Citizen Portal - ENHANCED v3.0      ║
║     🚀 Complete Village Management System 🚀        ║
╠══════════════════════════════════════════════════════╣
║  🟢 Server running on:                              ║
║     Local: http://localhost:${PORT}                   ║
║     Local Network: http://127.0.0.1:${PORT}           ║
${addresses.map(addr => `║     Network: http://${addr}:${PORT}`).join("\n")}
║                                                      ║
║  📱 Access from another device:                     ║
║     Open browser and enter any URL above            ║
║                                                      ║
║  📨 API available at: /api                          ║
║  💾 Data storage: ./data/                           ║
║                                                      ║
║  ✨ Features:                                        ║
║  ✅ Complaints & Grievance Tracking                 ║
║  ✅ Public Notices & Announcements                  ║
║  ✅ Service Directory                               ║
║  ✅ Events & Calendar                               ║
║  ✅ Budget & Expenditure Tracking                   ║
║  ✅ Suggestion & Feedback System                    ║
║  ✅ Employment & Jobs Board                         ║
║  ✅ Agriculture & Subsidy Hub                       ║
║  ✅ Real-time Analytics Dashboard                   ║
║  ✅ Admin Management Tools                          ║
╚══════════════════════════════════════════════════════╝
  `);
});
