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
      bar.innerHTML = '<div id="gsiButton"></div>';
      renderGoogleButton(document.getElementById("gsiButton"));
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
      body.innerHTML = list
        .map((c) => {
          const who = c.user
            ? `${escapeHtml(c.user.name || "")}<br><span class="text-[11px] text-slate-500">${escapeHtml(
                c.user.email || ""
              )}</span>`
            : escapeHtml(c.fullName || "");
          const opts = ["Pending", "In Review", "Resolved"]
            .map(
              (s) =>
                `<option ${s === c.status ? "selected" : ""}>${s}</option>`
            )
            .join("");
          return `<tr class="border-b border-white/5 align-top">
            <td class="p-3 text-slate-200">${who}</td>
            <td class="p-3 text-slate-300">${escapeHtml(c.wardNumber || "")}</td>
            <td class="p-3 text-slate-300">${escapeHtml(c.category || "")}</td>
            <td class="p-3 text-slate-400 max-w-xs">${escapeHtml(c.issue || "")}</td>
            <td class="p-3 text-slate-300">${escapeHtml(c.severity || "")}</td>
            <td class="p-3"><select data-id="${c.id}" class="admin-status bg-slate-950 border border-white/10 rounded p-1 text-white text-xs">${opts}</select></td>
            <td class="p-3"><button data-id="${c.id}" class="admin-save bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded">Save</button></td>
          </tr>`;
        })
        .join("");

      body.querySelectorAll(".admin-save").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const sel = body.querySelector(`.admin-status[data-id="${id}"]`);
          try {
            await window.HTTP.put(`${API_URL}/complaints/${id}`, {
              status: sel.value,
            });
            if (window.showNotification)
              window.showNotification("Status updated", "success");
          } catch (err) {
            if (window.showNotification)
              window.showNotification(
                err.message || "Update failed",
                "error"
              );
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
