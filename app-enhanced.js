const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  loadNotices();
  loadServices();
  loadEvents();
  loadAgriculture();
  loadJobs();
  loadSuggestions();
  loadBudget();
  loadComplaints();
  setupFormHandlers();
}

// ==================== NOTICES ====================

async function loadNotices() {
  try {
    const response = await fetch(`${API_URL}/notices`);
    const notices = await response.json();
    displayNotices(notices);
  } catch (error) {
    console.error("Error loading notices:", error);
  }
}

function displayNotices(notices) {
  const container = document.getElementById("noticesContainer");
  if (!notices || notices.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No notices yet</div>';
    return;
  }
  container.innerHTML = notices.slice(0, 6).map(notice => `
    <div class="glass rounded-2xl p-6 border border-white/5 ${notice.isPinned ? 'border-gp-accent/50 ring-2 ring-gp-accent/20' : ''}">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-bold text-white flex-1">${notice.title}</h3>
        ${notice.isPinned ? '<i class="fa-solid fa-thumbtack text-gp-accent text-lg"></i>' : ''}
      </div>
      <p class="text-sm text-slate-400 mb-4">${notice.content.substring(0, 100)}...</p>
      <p class="text-xs text-slate-500">${new Date(notice.createdAt).toLocaleDateString()}</p>
    </div>
  `).join("");
}

// ==================== SERVICES ====================

async function loadServices() {
  try {
    const response = await fetch(`${API_URL}/services`);
    const services = await response.json();
    displayServices(services);
  } catch (error) {
    console.error("Error loading services:", error);
  }
}

function displayServices(services) {
  const container = document.getElementById("servicesContainer");
  if (services.length === 0) return;
  container.innerHTML = services.map(service => `
    <div class="glass rounded-2xl p-6 border border-white/5 card-hover">
      <h3 class="text-lg font-bold text-white mb-2">${service.name}</h3>
      <p class="text-xs text-slate-500 mb-3">${service.type}</p>
      <p class="text-sm text-white mb-2">📞 ${service.contact}</p>
      <p class="text-xs text-slate-400">${service.address || 'Contact for address'}</p>
      ${service.hours ? `<p class="text-xs text-slate-500 mt-2">⏰ ${service.hours}</p>` : ''}
    </div>
  `).join("");
}

// ==================== EVENTS ====================

async function loadEvents() {
  try {
    const response = await fetch(`${API_URL}/events`);
    const events = await response.json();
    displayEvents(events);
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function displayEvents(events) {
  const container = document.getElementById("eventsContainer");
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No events scheduled</div>';
    return;
  }
  container.innerHTML = events.slice(0, 6).map(event => `
    <div class="glass rounded-2xl p-6 border border-white/5 card-hover">
      <h3 class="text-lg font-bold text-white mb-2">${event.title}</h3>
      <p class="text-sm text-gp-accent mb-3">📅 ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <p class="text-sm text-slate-400 mb-4">${event.description || 'Event details'}</p>
      <p class="text-xs text-slate-500">📍 ${event.location || 'Village'}</p>
    </div>
  `).join("");
}

// ==================== AGRICULTURE ====================

async function loadAgriculture() {
  try {
    const response = await fetch(`${API_URL}/agriculture`);
    const agriculture = await response.json();
    displayAgriculture(agriculture);
  } catch (error) {
    console.error("Error loading agriculture:", error);
  }
}

function displayAgriculture(agriculture) {
  const container = document.getElementById("agricultureContainer");
  if (agriculture.length === 0) return;
  container.innerHTML = agriculture.slice(0, 6).map(item => `
    <div class="glass rounded-2xl p-6 border border-white/5 card-hover">
      <h3 class="text-lg font-bold text-white mb-2">${item.title}</h3>
      <p class="text-xs text-gp-accent mb-3 font-bold">${item.category}</p>
      <p class="text-sm text-slate-400">${item.content || 'Information'}</p>
      ${item.link ? `<a href="${item.link}" target="_blank" class="text-xs text-gp-accent hover:text-purple-300 mt-3 inline-block">Learn more →</a>` : ''}
    </div>
  `).join("");
}

// ==================== JOBS ====================

async function loadJobs() {
  try {
    const response = await fetch(`${API_URL}/jobs`);
    const jobs = await response.json();
    displayJobs(jobs);
  } catch (error) {
    console.error("Error loading jobs:", error);
  }
}

function displayJobs(jobs) {
  const container = document.getElementById("jobsContainer");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No job postings yet</div>';
    return;
  }
  container.innerHTML = jobs.slice(0, 6).map(job => `
    <div class="glass rounded-2xl p-6 border border-white/5 card-hover">
      <h3 class="text-lg font-bold text-white mb-2">${job.title}</h3>
      <p class="text-xs text-gp-accent mb-3 font-bold">${job.type}</p>
      <p class="text-sm text-slate-400 mb-3">${job.description.substring(0, 100)}...</p>
      <p class="text-xs text-slate-500">📍 ${job.location}</p>
    </div>
  `).join("");
}

// ==================== SUGGESTIONS ====================

async function loadSuggestions() {
  try {
    const response = await fetch(`${API_URL}/suggestions`);
    const suggestions = await response.json();
    displaySuggestions(suggestions);
  } catch (error) {
    console.error("Error loading suggestions:", error);
  }
}

function displaySuggestions(suggestions) {
  const container = document.getElementById("suggestionsContainer");
  if (suggestions.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Share your first idea!</div>';
    return;
  }
  container.innerHTML = suggestions.slice(0, 6).map(suggestion => `
    <div class="glass rounded-2xl p-6 border border-white/5">
      <h3 class="text-lg font-bold text-white mb-3">${suggestion.title}</h3>
      <p class="text-sm text-slate-400 mb-4">${suggestion.description || 'Community suggestion'}</p>
      <div class="flex justify-between items-center">
        <button onclick="voteSuggestion(${suggestion.id})" class="text-sm font-bold text-gp-accent hover:text-purple-300">
          👍 ${suggestion.votes} Votes
        </button>
        <span class="text-xs text-slate-500">${new Date(suggestion.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `).join("");
}

async function submitSuggestion(e) {
  e.preventDefault();
  const title = document.getElementById("suggestionTitle").value;
  const description = document.getElementById("suggestionDesc").value;
  
  try {
    const response = await fetch(`${API_URL}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, anonymous: true }),
    });
    
    if (response.ok) {
      alert("✓ Thank you for your suggestion!");
      document.getElementById("suggestionTitle").value = "";
      document.getElementById("suggestionDesc").value = "";
      loadSuggestions();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function voteSuggestion(id) {
  try {
    await fetch(`${API_URL}/suggestions/${id}/vote`, { method: "PUT" });
    loadSuggestions();
  } catch (error) {
    console.error("Error:", error);
  }
}

// ==================== BUDGET ====================

async function loadBudget() {
  try {
    const response = await fetch(`${API_URL}/budget`);
    const data = await response.json();
    
    document.getElementById("budgetTotal").textContent = `₹${(data.total / 100000).toFixed(2)}L`;
    document.getElementById("budgetSpent").textContent = `₹${(data.spent / 100000).toFixed(2)}L`;
    document.getElementById("budgetRate").textContent = data.total > 0 ? Math.round((data.spent / data.total) * 100) + "%" : "0%";
    
    const container = document.getElementById("budgetContainer");
    if (data.projects && data.projects.length > 0) {
      container.innerHTML = data.projects.slice(0, 6).map(project => {
        const rate = project.allocated > 0 ? Math.round((project.spent / project.allocated) * 100) : 0;
        return `
          <div class="bg-slate-800/50 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold text-white text-sm">${project.projectName}</h4>
              <span class="text-xs font-bold text-gp-accent">${rate}%</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div class="bg-gp-accent h-2 rounded-full" style="width: ${rate}%"></div>
            </div>
            <p class="text-xs text-slate-400">₹${(project.spent / 100000).toFixed(2)}L / ₹${(project.allocated / 100000).toFixed(2)}L</p>
          </div>
        `;
      }).join("");
    }
  } catch (error) {
    console.error("Error loading budget:", error);
  }
}

// ==================== COMPLAINTS ====================

async function loadComplaints() {
  try {
    const response = await fetch(`${API_URL}/complaints`);
    const complaints = await response.json();
    displayComplaints(complaints);
  } catch (error) {
    console.error("Error loading complaints:", error);
  }
}

function displayComplaints(complaints) {
  const container = document.getElementById("complaintsContainer");
  if (!complaints || complaints.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No complaints yet</div>';
    return;
  }
  container.innerHTML = complaints.slice(0, 6).map(complaint => {
    const statusColor = complaint.status === "Pending" ? "yellow" : complaint.status === "Resolved" ? "emerald" : "blue";
    return `
      <div class="glass rounded-2xl p-6 border border-white/5">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-white flex-1">${complaint.fullName}</h3>
          <span class="px-2 py-1 bg-${statusColor}-500/20 text-${statusColor}-400 text-[10px] font-bold rounded-full">${complaint.status}</span>
        </div>
        <p class="text-sm text-slate-400 mb-2">${complaint.issue.substring(0, 80)}...</p>
        <div class="flex justify-between text-xs text-slate-500">
          <span>${complaint.category}</span>
          <span>${new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  }).join("");
}

// ==================== FORM HANDLERS ====================

function setupFormHandlers() {
  const form = document.getElementById("complaintForm");
  form.addEventListener("submit", submitComplaint);
}

async function submitComplaint(e) {
  e.preventDefault();
  
  const fullName = document.getElementById("fullName").value.trim();
  const wardNumber = document.getElementById("wardNumber").value;
  const category = document.getElementById("category").value;
  const severity = document.getElementById("severity").value;
  const issue = document.getElementById("issue").value.trim();
  const submitBtn = document.getElementById("submitBtn");
  
  if (!fullName || !wardNumber || !category || !issue) {
    alert("Please fill all required fields");
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = "⏳ SUBMITTING...";
  
  try {
    const response = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, wardNumber, category, severity, issue, photo: null }),
    });
    
    if (response.ok) {
      alert("✓ Complaint submitted successfully!");
      document.getElementById("complaintForm").reset();
      loadComplaints();
    } else {
      alert("❌ Failed to submit complaint");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Connection error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "SUBMIT COMPLAINT";
  }
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
}
