// Pachtaki Yadu - Enhanced Complaint Management System
// All-in-one JavaScript file for frontend functionality

// Dynamically set API URL based on current host
const API_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
let allComplaints = [];
let photoData = null;

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  setupFormHandlers();
  setupPhotoUpload();
  setupThemeToggle();
  setupSearch();
  loadComplaints();
  loadAdminTable();
  loadStatistics();
  setupAutoRefresh();
}

// ==================== THEME TOGGLE ====================

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "dark";

  applyTheme(savedTheme);

  toggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.innerHTML =
      theme === "dark"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
  }
}

// ==================== PHOTO UPLOAD ====================

function setupPhotoUpload() {
  const photoInput = document.getElementById("photoUpload");
  const photoLabel = photoInput.parentElement;
  const removeBtn = document.getElementById("removePhoto");

  photoLabel.addEventListener("click", () => photoInput.click());

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoData = event.target.result;
        document.getElementById("previewImage").src = photoData;
        document.getElementById("photoPreview").classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      alert("File size must be less than 5MB");
    }
  });

  removeBtn.addEventListener("click", () => {
    photoData = null;
    photoInput.value = "";
    document.getElementById("photoPreview").classList.add("hidden");
  });
}

// ==================== FORM SUBMISSION ====================

function setupFormHandlers() {
  const form = document.getElementById("complaintForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitComplaint();
  });
}

async function submitComplaint() {
  const fullName = document.getElementById("fullName").value.trim();
  const wardNumber = document.getElementById("wardNumber").value;
  const category = document.getElementById("category").value;
  const severity = document.getElementById("severity").value;
  const issue = document.getElementById("issue").value.trim();
  const submitBtn = document.getElementById("submitBtn");
  const responseMessage = document.getElementById("responseMessage");

  if (!fullName || !wardNumber || !category || !issue) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = "⏳ SUBMITTING...";

  try {
    const payload = { fullName, wardNumber, category, severity, issue };
    if (photoData) payload.photo = photoData; // base64 data URL

    const response = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("✓ Report submitted successfully!", "success");
      document.getElementById("complaintForm").reset();
      photoData = null;
      document.getElementById("photoPreview").classList.add("hidden");

      setTimeout(() => {
        loadComplaints();
        loadStatistics();
        loadAdminTable();
        document
          .getElementById("complaints-list")
          .scrollIntoView({ behavior: "smooth" });
      }, 1000);
    } else {
      showMessage("✗ " + (data.error || "Failed to submit"), "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("✗ Connection error. Make sure backend is running.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "SUBMIT REPORT";
  }
}

function showMessage(message, type) {
  const responseMessage = document.getElementById("responseMessage");
  responseMessage.textContent = message;
  responseMessage.classList.remove("hidden");

  if (type === "success") {
    responseMessage.classList.remove(
      "bg-red-500/20",
      "text-red-400",
      "border-red-500/20",
      "border",
    );
    responseMessage.classList.add(
      "bg-emerald-500/20",
      "text-emerald-400",
      "border",
      "border-emerald-500/20",
    );
  } else {
    responseMessage.classList.remove(
      "bg-emerald-500/20",
      "text-emerald-400",
      "border-emerald-500/20",
      "border",
    );
    responseMessage.classList.add(
      "bg-red-500/20",
      "text-red-400",
      "border",
      "border-red-500/20",
    );
  }

  setTimeout(() => {
    responseMessage.classList.add("hidden");
  }, 5000);
}

// ==================== COMPLAINTS DISPLAY ====================

async function loadComplaints() {
  try {
    const response = await fetch(`${API_URL}/complaints`);
    allComplaints = await response.json();
    displayComplaints(allComplaints);
  } catch (error) {
    console.error("Error loading complaints:", error);
  }
}

function displayComplaints(complaints) {
  const container = document.getElementById("complaintsContainer");

  if (!complaints || complaints.length === 0) {
    container.innerHTML = `
            <div class="glass rounded-2xl p-6 border border-white/5 text-center py-12 md:col-span-2 lg:col-span-3">
                <i class="fa-solid fa-inbox text-4xl text-slate-500 mb-4"></i>
                <p class="text-slate-400">No complaints yet. Be the first to report an issue!</p>
            </div>
        `;
    return;
  }

  container.innerHTML = complaints
    .map((complaint) => {
      const statusColor =
        complaint.status === "Pending"
          ? "yellow"
          : complaint.status === "In Progress"
            ? "blue"
            : "emerald";
      const severityColor =
        complaint.severity === "High"
          ? "red"
          : complaint.severity === "Medium"
            ? "amber"
            : "green";
      const categoryIcon =
        {
          "Road & Infrastructure": "🛣️",
          "Water Supply": "💧",
          Electricity: "⚡",
          Sanitation: "🧹",
          "Public Services": "🏛️",
          Other: "📝",
        }[complaint.category] || "📝";

      const createdDate = new Date(complaint.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );

      return `
            <div class="glass rounded-2xl p-6 border border-white/5 hover:border-gp-accent/30 transition-all complaint-item" data-status="${complaint.status.toLowerCase()}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-lg">${categoryIcon}</span>
                            <span class="px-2 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-bold rounded">${complaint.category}</span>
                        </div>
                        <h3 class="text-white font-bold text-lg mb-1">${escapeHtml(complaint.fullName)}</h3>
                        <p class="text-slate-400 text-sm"><i class="fa-solid fa-map-pin text-gp-accent mr-2"></i>${escapeHtml(complaint.wardNumber)}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="px-3 py-1 bg-${statusColor}-500/10 text-${statusColor}-400 text-[10px] font-black uppercase rounded-full border border-${statusColor}-500/20 whitespace-nowrap text-center">
                            ${complaint.status}
                        </span>
                        <span class="px-3 py-1 bg-${severityColor}-500/10 text-${severityColor}-400 text-[10px] font-black uppercase rounded-full border border-${severityColor}-500/20 whitespace-nowrap text-center">
                            ${complaint.severity}
                        </span>
                    </div>
                </div>
                
                <p class="text-slate-300 text-sm mb-4 leading-relaxed">${escapeHtml(complaint.issue)}</p>
                
                ${complaint.photo ? `<img src="${complaint.photo}" alt="Issue photo" class="w-full rounded-lg mb-4 max-h-48 object-cover border border-white/10">` : ""}
                
                <div class="flex items-center justify-between pt-4 border-t border-white/5">
                    <p class="text-[10px] text-slate-500"><i class="fa-solid fa-calendar mr-1"></i>${createdDate}</p>
                    <p class="text-[10px] text-slate-600 font-mono">ID: ${complaint.id}</p>
                </div>
            </div>
        `;
    })
    .join("");
}

function filterComplaints(status) {
  const buttons = document.querySelectorAll('button[id^="filter-"]');
  const items = document.querySelectorAll(".complaint-item");

  buttons.forEach((btn) => btn.classList.remove("tab-active", "text-white"));
  buttons.forEach((btn) => btn.classList.add("text-slate-400"));
  document
    .getElementById("filter-" + status)
    .classList.add("tab-active", "text-white");

  items.forEach((item) => {
    if (status === "all") {
      item.style.display = "block";
    } else if (item.dataset.status === status) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// ==================== STATISTICS ====================

function loadStatistics() {
  if (allComplaints.length === 0) {
    document.getElementById("statTotal").textContent = "0";
    document.getElementById("statPending").textContent = "0";
    document.getElementById("statResolved").textContent = "0";
    document.getElementById("statRate").textContent = "0%";
    return;
  }

  const total = allComplaints.length;
  const pending = allComplaints.filter((c) => c.status === "Pending").length;
  const resolved = allComplaints.filter((c) => c.status === "Resolved").length;
  const rate = Math.round((resolved / total) * 100);

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statResolved").textContent = resolved;
  document.getElementById("statRate").textContent = rate + "%";

  // Category distribution
  const categoryCount = {};
  allComplaints.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  });

  const categoryHTML = Object.entries(categoryCount)
    .map(
      ([cat, count]) => `
        <div class="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
            <span class="text-slate-300">${cat}</span>
            <span class="bg-gp-accent/20 text-gp-accent px-3 py-1 rounded font-bold">${count}</span>
        </div>
    `,
    )
    .join("");

  document.getElementById("categoryStats").innerHTML = categoryHTML;
}

// ==================== ADMIN DASHBOARD ====================

function loadAdminTable() {
  const tbody = document.getElementById("adminTableBody");

  if (allComplaints.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-500">No complaints yet</td></tr>';
    return;
  }

  tbody.innerHTML = allComplaints
    .map((complaint) => {
      const date = new Date(complaint.createdAt).toLocaleDateString("en-US");
      return `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="px-4 py-3 text-slate-300 font-mono text-xs">${complaint.id}</td>
                <td class="px-4 py-3 text-slate-300">${escapeHtml(complaint.fullName)}</td>
                <td class="px-4 py-3 text-slate-300">${complaint.category}</td>
                <td class="px-4 py-3">
                    <span class="text-xs font-bold ${complaint.severity === "High" ? "text-red-400" : complaint.severity === "Medium" ? "text-yellow-400" : "text-green-400"}">
                        ${complaint.severity}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded ${complaint.status === "Resolved" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}">
                        ${complaint.status}
                    </span>
                </td>
                <td class="px-4 py-3 text-slate-400 text-xs">${date}</td>
                <td class="px-4 py-3">
                    <button onclick="openUpdateModal(${complaint.id})" class="text-gp-accent hover:text-purple-400 text-sm font-bold transition-colors">
                        Update
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function openUpdateModal(id) {
  document.getElementById("updateId").value = id;
  document.getElementById("updateModal").classList.add("active");
}

function closeUpdateModal() {
  document.getElementById("updateModal").classList.remove("active");
}

async function saveStatusUpdate() {
  const id = document.getElementById("updateId").value;
  const newStatus = document.getElementById("updateStatus").value;
  const note = document.getElementById("updateNote").value;

  try {
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note: note }),
    });

    if (response.ok) {
      alert("Status updated successfully!");
      closeUpdateModal();
      loadComplaints();
      loadAdminTable();
      loadStatistics();
    } else {
      alert("Failed to update status");
    }
  } catch (error) {
    alert("Error updating status");
    console.error(error);
  }
}

// ==================== SEARCH & EXPORT ====================

function setupSearch() {
  const searchInput = document.getElementById("searchComplaints");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#adminTableBody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });
}

function exportComplaintsCSV() {
  if (allComplaints.length === 0) {
    alert("No complaints to export");
    return;
  }

  const headers = [
    "ID",
    "Name",
    "Ward",
    "Category",
    "Severity",
    "Status",
    "Date",
    "Issue",
  ];
  const rows = allComplaints.map((c) => [
    c.id,
    c.fullName,
    c.wardNumber,
    c.category,
    c.severity,
    c.status,
    new Date(c.createdAt).toLocaleDateString(),
    c.issue,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function setupAutoRefresh() {
  setInterval(() => {
    loadComplaints();
    loadStatistics();
    loadAdminTable();
  }, 10000);
}

// Close modal on background click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("updateModal");
  if (e.target === modal) {
    closeUpdateModal();
  }
});
