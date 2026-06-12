// ========================================
// AUTH MODULE — Google login + JWT + role gating
// ----------------------------------------
// Owns: storing the JWT, attaching it to every HTTP request, rendering the
// login/logout bar + Google button, gating the complaint form behind login,
// and injecting an Admin Dashboard for admin users.
// Loaded AFTER config.js + http-client.js, BEFORE app-safe.js.
// ========================================

const AUTH = (() => {
  const TOKEN_KEY = "pachtaki_token";
  const USER_KEY = "pachtaki_user";

  // Build the API base URL the same way app-safe.js does.
  const API_URL = window.CONFIG
    ? window.CONFIG.getAPIUrl()
    : `${window.location.protocol}//${window.location.hostname}:3000/api`;

  // The Google client id is injected into index.html as window.GOOGLE_CLIENT_ID.
  const CLIENT_ID = window.GOOGLE_CLIENT_ID || "";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }
  function isAuthenticated() {
    return Boolean(getToken());
  }
  function isAdmin() {
    const u = getUser();
    return Boolean(u && u.role === "admin");
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Attach the bearer token to every request made through window.HTTP.
  function installInterceptor() {
    if (!window.HTTP || !window.HTTP.addRequestInterceptor) return;
    window.HTTP.addRequestInterceptor((options) => {
      const token = getToken();
      if (token) {
        options.headers = options.headers || {};
        options.headers["Authorization"] = "Bearer " + token;
      }
      return options;
    });
  }

  // --- Google sign-in -------------------------------------------------
  async function handleCredential(response) {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign-in failed");

      setSession(data.token, data.user);
      onAuthChange();
      closeModal(); // close the login modal after a successful Google sign-in
      if (window.showNotification) {
        window.showNotification(`Welcome, ${data.user.name}!`, "success");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (window.showNotification) {
        window.showNotification(err.message || "Sign-in failed", "error");
      }
    }
  }

  // --- Email / password sign in + sign up ----------------------------
  async function postAuth(path, body) {
    const res = await fetch(`${API_URL}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function handleLogin(email, password) {
    const data = await postAuth("login", { email, password });
    setSession(data.token, data.user);
    onAuthChange();
    closeModal();
    if (window.showNotification)
      window.showNotification(`Welcome back, ${data.user.name}!`, "success");
  }

  async function handleRegister(name, email, password) {
    const data = await postAuth("register", { name, email, password });
    setSession(data.token, data.user);
    onAuthChange();
    closeModal();
    if (window.showNotification)
      window.showNotification(`Account created. Welcome, ${data.user.name}!`, "success");
  }

  // --- Auth modal (Sign In / Sign Up tabs + Google) ------------------
  function ensureModal() {
    let modal = document.getElementById("authModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "authModal";
    modal.className =
      "fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 p-4";
    modal.innerHTML = `
      <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 relative">
        <button id="authClose" class="absolute top-3 right-4 text-slate-400 hover:text-white text-xl">&times;</button>
        <div class="flex gap-2 mb-5">
          <button id="tabSignin" class="flex-1 py-2 rounded-lg text-sm font-bold bg-purple-600 text-white">Sign In</button>
          <button id="tabSignup" class="flex-1 py-2 rounded-lg text-sm font-bold bg-slate-700 text-slate-300">Sign Up</button>
        </div>
        <p id="authError" class="text-red-400 text-xs font-semibold mb-3 hidden"></p>

        <form id="signinForm" class="space-y-3">
          <input type="email" id="siEmail" placeholder="Email" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <input type="password" id="siPass" placeholder="Password" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-sm">Sign In</button>
        </form>

        <form id="signupForm" class="space-y-3 hidden">
          <input type="text" id="suName" placeholder="Full Name" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <input type="email" id="suEmail" placeholder="Email" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <input type="password" id="suPass" placeholder="Password (min 6 chars)" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-sm">Create Account</button>
          <p class="text-[11px] text-slate-500">Admins are granted automatically for approved emails.</p>
        </form>

        <div class="flex items-center gap-3 my-4">
          <div class="flex-1 h-px bg-white/10"></div><span class="text-[11px] text-slate-500">or</span><div class="flex-1 h-px bg-white/10"></div>
        </div>
        <div id="modalGsi" class="flex justify-center"></div>
      </div>`;
    document.body.appendChild(modal);

    const err = modal.querySelector("#authError");
    const showErr = (m) => {
      err.textContent = m;
      err.classList.remove("hidden");
    };
    const clearErr = () => err.classList.add("hidden");

    modal.querySelector("#authClose").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    const siForm = modal.querySelector("#signinForm");
    const suForm = modal.querySelector("#signupForm");
    const tabIn = modal.querySelector("#tabSignin");
    const tabUp = modal.querySelector("#tabSignup");

    function selectTab(which) {
      clearErr();
      const inActive = which === "in";
      siForm.classList.toggle("hidden", !inActive);
      suForm.classList.toggle("hidden", inActive);
      tabIn.className = `flex-1 py-2 rounded-lg text-sm font-bold ${
        inActive ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300"
      }`;
      tabUp.className = `flex-1 py-2 rounded-lg text-sm font-bold ${
        !inActive ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300"
      }`;
    }
    tabIn.addEventListener("click", () => selectTab("in"));
    tabUp.addEventListener("click", () => selectTab("up"));

    siForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErr();
      try {
        await handleLogin(
          modal.querySelector("#siEmail").value.trim(),
          modal.querySelector("#siPass").value
        );
      } catch (er) {
        showErr(er.message);
      }
    });
    suForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErr();
      try {
        await handleRegister(
          modal.querySelector("#suName").value.trim(),
          modal.querySelector("#suEmail").value.trim(),
          modal.querySelector("#suPass").value
        );
      } catch (er) {
        showErr(er.message);
      }
    });

    return modal;
  }

  function openModal() {
    const modal = ensureModal();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    renderGoogleButton(modal.querySelector("#modalGsi"));
  }
  function closeModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  // Poll until the GIS script is ready, then render the button into `el`.
  function renderGoogleButton(el) {
    if (!CLIENT_ID) {
      el.innerHTML =
        '<span class="text-xs text-yellow-400">Google login not configured</span>';
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(timer);
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
        });
        window.google.accounts.id.renderButton(el, {
          theme: "filled_blue",
          size: "medium",
          type: "standard",
          text: "signin_with",
          shape: "pill",
        });
      } else if (++tries > 50) {
        clearInterval(timer);
      }
    }, 100);
  }

  function logout() {
    clearSession();
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    onAuthChange();
    if (window.showNotification) {
      window.showNotification("Logged out", "info");
    }
  }

  // --- Auth bar (in the navbar) --------------------------------------
  function renderAuthBar() {
    const bar = document.getElementById("authBar");
    if (!bar) return;

    if (isAuthenticated()) {
      const u = getUser() || {};
      const badge =
        u.role === "admin"
          ? '<span class="ml-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">ADMIN</span>'
          : "";
      bar.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-300 hidden sm:inline">${escapeHtml(
            u.name || u.email || "User"
          )}</span>${badge}
          <button id="logoutBtn" class="text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-full transition">Logout</button>
        </div>`;
      const btn = document.getElementById("logoutBtn");
      if (btn) btn.addEventListener("click", logout);
    } else {
      bar.innerHTML =
        '<button id="openAuth" class="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full transition"><i class="fa-solid fa-right-to-bracket mr-1"></i>Sign In / Sign Up</button>';
      const btn = document.getElementById("openAuth");
      if (btn) btn.addEventListener("click", openModal);
    }
  }

  // --- Gate the complaint form ---------------------------------------
  function gateComplaintForm() {
    const form = document.getElementById("complaintForm");
    const notice = document.getElementById("loginNotice");
    if (!form) return;

    if (isAuthenticated()) {
      form.classList.remove("opacity-50", "pointer-events-none");
      if (notice) notice.classList.add("hidden");
    } else {
      form.classList.add("opacity-50", "pointer-events-none");
      if (notice) notice.classList.remove("hidden");
    }
  }

  // --- Admin dashboard (injected, admins only) -----------------------
  function ensureAdminSection() {
    let section = document.getElementById("adminDashboard");
    if (section) return section;

    section = document.createElement("section");
    section.id = "adminDashboard";
    section.className = "py-16 px-4 md:px-6 bg-slate-800/30 hidden";
    section.innerHTML = `
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">
          <i class="fa-solid fa-shield-halved text-purple-500 mr-2"></i>Admin Dashboard
        </h2>
        <p class="text-slate-400 text-sm mb-6">All citizen complaints. Update status as you resolve them.</p>
        <div class="overflow-x-auto glass rounded-2xl border border-white/5">
          <table class="w-full text-sm text-left">
            <thead class="text-slate-400 border-b border-white/10">
              <tr>
                <th class="p-3">Citizen</th><th class="p-3">Ward</th>
                <th class="p-3">Category</th><th class="p-3">Issue</th>
                <th class="p-3">Severity</th><th class="p-3">Status</th><th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody id="adminBody"><tr><td class="p-4 text-slate-500" colspan="7">Loading…</td></tr></tbody>
          </table>
        </div>
      </div>`;

    const anchor = document.getElementById("complaints");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(section, anchor.nextSibling);
    } else {
      document.body.appendChild(section);
    }
    return section;
  }

  async function loadAdminDashboard() {
    const section = ensureAdminSection();
    if (!isAdmin()) {
      section.classList.add("hidden");
      return;
    }
    section.classList.remove("hidden");
    const body = document.getElementById("adminBody");
    try {
      const list = await window.HTTP.get(`${API_URL}/complaints`);
      if (!list.length) {
        body.innerHTML =
          '<tr><td class="p-4 text-slate-500" colspan="7">No complaints yet.</td></tr>';
        return;
      }
      const SEV = ["Low", "Medium", "High", "Critical"];
      const STA = ["Pending", "Ongoing", "Completed"];
      const dropdown = (arr, cur, cls, id) =>
        `<select data-id="${id}" class="${cls} bg-slate-950 border border-white/10 rounded p-1 text-white text-xs">` +
        arr
          .map((s) => `<option ${s === cur ? "selected" : ""}>${s}</option>`)
          .join("") +
        `</select>`;

      body.innerHTML = list
        .map((c) => {
          const who = c.user
            ? `${escapeHtml(c.user.name || "")}<br><span class="text-[11px] text-slate-500">${escapeHtml(
                c.user.email || ""
              )}</span>`
            : escapeHtml(c.fullName || "");
          // Every field is an editable input/select so admins can change anything.
          return `<tr class="border-b border-white/5 align-top">
            <td class="p-2 text-slate-200">${who}</td>
            <td class="p-2"><input data-id="${c.id}" class="a-ward bg-slate-950 border border-white/10 rounded p-1 text-white text-xs w-20" value="${escapeHtml(c.wardNumber || "")}"></td>
            <td class="p-2"><input data-id="${c.id}" class="a-cat bg-slate-950 border border-white/10 rounded p-1 text-white text-xs w-28" value="${escapeHtml(c.category || "")}"></td>
            <td class="p-2"><input data-id="${c.id}" class="a-issue bg-slate-950 border border-white/10 rounded p-1 text-white text-xs w-48" value="${escapeHtml(c.issue || "")}"></td>
            <td class="p-2">${dropdown(SEV, c.severity, "a-sev", c.id)}</td>
            <td class="p-2">${dropdown(STA, c.status, "a-status", c.id)}</td>
            <td class="p-2 whitespace-nowrap">
              <button data-id="${c.id}" class="a-save bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded">Save</button>
              <button data-id="${c.id}" class="a-del bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2 py-1 rounded ml-1">Delete</button>
            </td>
          </tr>`;
        })
        .join("");

      const val = (cls, id) =>
        body.querySelector(`.${cls}[data-id="${id}"]`).value;

      // Save = update ALL fields of that complaint.
      body.querySelectorAll(".a-save").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          try {
            await window.HTTP.put(`${API_URL}/complaints/${id}`, {
              wardNumber: val("a-ward", id),
              category: val("a-cat", id),
              issue: val("a-issue", id),
              severity: val("a-sev", id),
              status: val("a-status", id),
            });
            if (window.showNotification)
              window.showNotification("Complaint updated", "success");
            if (window.loadComplaints) window.loadComplaints(); // refresh public feed
          } catch (err) {
            if (window.showNotification)
              window.showNotification(err.message || "Update failed", "error");
          }
        });
      });

      // Delete = remove the complaint permanently (with confirmation).
      body.querySelectorAll(".a-del").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!window.confirm("Delete this complaint permanently?")) return;
          const id = btn.dataset.id;
          try {
            await window.HTTP.delete(`${API_URL}/complaints/${id}`);
            if (window.showNotification)
              window.showNotification("Complaint deleted", "success");
            loadAdminDashboard(); // refresh the table
            if (window.loadComplaints) window.loadComplaints();
          } catch (err) {
            if (window.showNotification)
              window.showNotification(err.message || "Delete failed", "error");
          }
        });
      });
    } catch (err) {
      body.innerHTML = `<tr><td class="p-4 text-red-400" colspan="7">${escapeHtml(
        err.message || "Failed to load"
      )}</td></tr>`;
    }
  }

  // Called whenever auth state changes (login/logout).
  function onAuthChange() {
    renderAuthBar();
    gateComplaintForm();
    loadAdminDashboard();
    // Refresh the citizen's own complaints list if app-safe.js is loaded.
    if (window.loadComplaints) window.loadComplaints();
    if (window.loadStatistics) window.loadStatistics();
    // Re-render info sections so admin add/edit/delete controls toggle.
    if (window.CONTENT) window.CONTENT.refresh();
  }

  function escapeHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }

  function init() {
    installInterceptor();
    renderAuthBar();
    gateComplaintForm();
    loadAdminDashboard();
  }

  return {
    init,
    isAuthenticated,
    isAdmin,
    getToken,
    getUser,
    logout,
    onAuthChange,
    API_URL,
  };
})();

window.AUTH = AUTH;

// Initialize once the DOM is ready (after the navbar/form exist).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => AUTH.init());
} else {
  AUTH.init();
}
