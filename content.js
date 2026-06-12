// ========================================
// CONTENT MANAGER — Government Services, Village Events, Agriculture,
// Job Opportunities, Budget. Public can view; admins can add/edit/delete.
// Loads after auth.js + app-safe.js. Uses window.HTTP (token auto-attached).
// ========================================
const CONTENT = (() => {
  const API_URL = window.CONFIG
    ? window.CONFIG.getAPIUrl()
    : `${window.location.protocol}//${window.location.hostname}:3000/api`;

  // Each managed section: key (server), container id, friendly noun, meta hint.
  const SECTIONS = [
    { key: "services", container: "servicesContainer", noun: "Service", hint: "e.g. Mon–Sat, 10–5" },
    { key: "events", container: "eventsContainer", noun: "Event", hint: "e.g. 15 Aug 2026" },
    { key: "agriculture", container: "agricultureContainer", noun: "Scheme", hint: "e.g. Eligibility / subsidy" },
    { key: "jobs", container: "jobsContainer", noun: "Job", hint: "e.g. Salary / last date" },
    { key: "budget", container: "budgetContainer", noun: "Budget item", hint: "e.g. ₹5,00,000" },
  ];

  const cache = {}; // section key -> items (for prefilling the edit form)

  const isAdmin = () => !!(window.AUTH && window.AUTH.isAdmin());
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  // --- Render -------------------------------------------------------
  function card(s, it) {
    const adminBtns = isAdmin()
      ? `<div class="flex gap-3 mt-3 pt-3 border-t border-white/5">
           <button data-id="${it.id}" class="c-edit text-xs font-bold text-purple-400 hover:text-purple-300">Edit</button>
           <button data-id="${it.id}" class="c-del text-xs font-bold text-red-400 hover:text-red-300">Delete</button>
         </div>`
      : "";
    const metaBadge = it.meta
      ? `<span class="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded mb-2">${esc(it.meta)}</span>`
      : "";
    return `<div class="glass rounded-xl p-6 border border-white/10">
      ${metaBadge ? metaBadge + "<br>" : ""}
      <h3 class="text-white font-bold mb-2">${esc(it.title)}</h3>
      <p class="text-slate-400 text-sm whitespace-pre-line">${esc(it.description || "")}</p>
      ${adminBtns}
    </div>`;
  }

  function render(s, items) {
    const cont = document.getElementById(s.container);
    if (!cont) return;
    cache[s.key] = items;
    cont.innerHTML = items.length
      ? items.map((it) => card(s, it)).join("")
      : `<div class="glass rounded-xl p-6 border border-white/10 text-center text-slate-500 md:col-span-2 lg:col-span-3">Nothing here yet${isAdmin() ? ' — click "Add" to create one.' : "."}</div>`;

    if (isAdmin()) {
      cont.querySelectorAll(".c-edit").forEach((b) =>
        b.addEventListener("click", () => openEditor(s, b.dataset.id))
      );
      cont.querySelectorAll(".c-del").forEach((b) =>
        b.addEventListener("click", () => remove(s, b.dataset.id))
      );
    }
  }

  async function loadSection(s) {
    const cont = document.getElementById(s.container);
    if (!cont) return;
    try {
      const items = await window.HTTP.get(`${API_URL}/content/${s.key}`);
      render(s, items);
    } catch (e) {
      console.error("Load content failed:", s.key, e.message);
      cont.innerHTML =
        '<div class="glass rounded-xl p-6 border border-white/10 text-center text-slate-500 md:col-span-2 lg:col-span-3">Could not load.</div>';
    }
  }

  async function loadAll() {
    for (const s of SECTIONS) await loadSection(s);
    injectAddButtons();
  }

  // --- Admin "Add" buttons in each section heading ------------------
  function injectAddButtons() {
    SECTIONS.forEach((s) => {
      const section = document.getElementById(s.key);
      if (!section) return;
      const h2 = section.querySelector("h2");
      if (!h2) return;
      let btn = section.querySelector(".c-add");
      if (!isAdmin()) {
        if (btn) btn.remove();
        return;
      }
      if (btn) return; // already there
      btn = document.createElement("button");
      btn.className =
        "c-add ml-3 align-middle text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full";
      btn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i>Add';
      btn.addEventListener("click", () => openEditor(s, null));
      h2.appendChild(btn);
    });
  }

  // --- Add / Edit modal ---------------------------------------------
  function ensureModal() {
    let m = document.getElementById("contentModal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "contentModal";
    m.className =
      "fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 p-4";
    m.innerHTML = `
      <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
        <button id="cmClose" class="absolute top-3 right-4 text-slate-400 hover:text-white text-xl">&times;</button>
        <h3 id="cmTitle" class="text-lg font-bold text-white mb-4">Add item</h3>
        <p id="cmError" class="text-red-400 text-xs font-semibold mb-3 hidden"></p>
        <form id="cmForm" class="space-y-3">
          <input id="cmName" type="text" placeholder="Title" required class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <input id="cmMeta" type="text" placeholder="Detail (optional)" class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
          <textarea id="cmDesc" rows="4" placeholder="Description" class="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"></textarea>
          <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-sm">Save</button>
        </form>
      </div>`;
    document.body.appendChild(m);
    m.querySelector("#cmClose").addEventListener("click", closeModal);
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal();
    });
    return m;
  }

  function closeModal() {
    const m = document.getElementById("contentModal");
    if (m) {
      m.classList.add("hidden");
      m.classList.remove("flex");
    }
  }

  function openEditor(s, id) {
    const m = ensureModal();
    const item = id ? (cache[s.key] || []).find((x) => x.id === id) : null;

    m.querySelector("#cmTitle").textContent =
      (id ? "Edit " : "Add ") + s.noun;
    m.querySelector("#cmName").value = item ? item.title : "";
    m.querySelector("#cmMeta").value = item ? item.meta || "" : "";
    m.querySelector("#cmMeta").placeholder = s.hint;
    m.querySelector("#cmDesc").value = item ? item.description || "" : "";
    const err = m.querySelector("#cmError");
    err.classList.add("hidden");

    const form = m.querySelector("#cmForm");
    form.onsubmit = async (e) => {
      e.preventDefault();
      err.classList.add("hidden");
      const payload = {
        section: s.key,
        title: m.querySelector("#cmName").value.trim(),
        meta: m.querySelector("#cmMeta").value.trim(),
        description: m.querySelector("#cmDesc").value.trim(),
      };
      if (!payload.title) {
        err.textContent = "Title is required";
        err.classList.remove("hidden");
        return;
      }
      try {
        if (id) {
          await window.HTTP.put(`${API_URL}/content/${id}`, payload);
        } else {
          await window.HTTP.post(`${API_URL}/content`, payload);
        }
        closeModal();
        await loadSection(s);
        if (window.showNotification)
          window.showNotification(id ? "Item updated" : "Item added", "success");
      } catch (er) {
        err.textContent = er.message || "Save failed";
        err.classList.remove("hidden");
      }
    };

    m.classList.remove("hidden");
    m.classList.add("flex");
  }

  async function remove(s, id) {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await window.HTTP.delete(`${API_URL}/content/${id}`);
      await loadSection(s);
      if (window.showNotification)
        window.showNotification("Item deleted", "success");
    } catch (e) {
      if (window.showNotification)
        window.showNotification(e.message || "Delete failed", "error");
    }
  }

  function init() {
    loadAll();
  }
  return { init, refresh: loadAll };
})();

window.CONTENT = CONTENT;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => CONTENT.init());
} else {
  CONTENT.init();
}
