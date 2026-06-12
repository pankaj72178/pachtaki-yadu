// ========================================
// PACHTAKI YADU - SAFE APP WITH NULL CHECKS
// ========================================
// Comprehensive error handling and null reference protection

// ========================================
// SAFE DOM UTILITIES
// ========================================

/**
 * Safely get an element by ID with logging
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - Element or null
 */
const safeGetById = (id) => {
  if (!id || typeof id !== 'string') {
    console.warn(`⚠️ Invalid ID: ${id}`);
    return null;
  }
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`⚠️ Element not found: #${id}`);
  }
  return element;
};

/**
 * Safely query selector with logging
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} - Element or null
 */
const safeQuerySelector = (selector) => {
  if (!selector || typeof selector !== 'string') {
    console.warn(`⚠️ Invalid selector: ${selector}`);
    return null;
  }
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`⚠️ Selector not found: ${selector}`);
  }
  return element;
};

/**
 * Safely add event listener
 * @param {HTMLElement|string} elementOrId - Element or element ID
 * @param {string} eventType - Event type (e.g., 'click', 'submit')
 * @param {Function} handler - Event handler function
 * @returns {boolean} - Success status
 */
const safeAddEventListener = (elementOrId, eventType, handler) => {
  try {
    const element = typeof elementOrId === 'string' 
      ? safeGetById(elementOrId) 
      : elementOrId;
    
    if (!element) {
      console.warn(`⚠️ Cannot attach listener: element not found`);
      return false;
    }
    
    if (typeof handler !== 'function') {
      console.warn(`⚠️ Invalid handler: not a function`);
      return false;
    }
    
    element.addEventListener(eventType, handler);
    return true;
  } catch (error) {
    console.error(`❌ Error adding event listener:`, error);
    return false;
  }
};

/**
 * Safely get element value
 * @param {string} id - Element ID
 * @returns {string} - Element value or empty string
 */
const safeGetValue = (id) => {
  const element = safeGetById(id);
  return element ? element.value.trim() : '';
};

/**
 * Safely set element text content
 * @param {string} id - Element ID
 * @param {string} text - Text content
 * @returns {boolean} - Success status
 */
const safeSetText = (id, text) => {
  const element = safeGetById(id);
  if (element) {
    element.textContent = text;
    return true;
  }
  return false;
};

/**
 * Safely set element HTML content
 * @param {string} id - Element ID
 * @param {string} html - HTML content
 * @returns {boolean} - Success status
 */
const safeSetHtml = (id, html) => {
  const element = safeGetById(id);
  if (element) {
    element.innerHTML = html;
    return true;
  }
  return false;
};

/**
 * Safely add/remove CSS classes
 * @param {string} id - Element ID
 * @param {string|string[]} classes - Class name(s) to toggle
 * @param {string} action - 'add', 'remove', or 'toggle'
 * @returns {boolean} - Success status
 */
const safeToggleClass = (id, classes, action = 'toggle') => {
  const element = safeGetById(id);
  if (!element) return false;
  
  const classList = Array.isArray(classes) ? classes : [classes];
  try {
    classList.forEach(className => {
      element.classList[action](className);
    });
    return true;
  } catch (error) {
    console.error(`❌ Error toggling class:`, error);
    return false;
  }
};

// ========================================
// API CONFIGURATION
// ========================================
// Use dynamic config loaded from config.js
// Falls back to hardcoded values if config not available

const API_URL = window.CONFIG ? window.CONFIG.getAPIUrl() : `${window.location.protocol}//${window.location.hostname}:3000/api`;
const N8N_WEBHOOK = window.CONFIG ? window.CONFIG.getWebhookUrl('n8n') : 'https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5';

// Global state
let allComplaints = [];
let photoData = null;

console.log(`🚀 API URL: ${API_URL}`);
console.log(`🚀 N8N Webhook: ${N8N_WEBHOOK}`);

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded');
  initializeApp();
});

function initializeApp() {
  try {
    console.log('🔄 Initializing app...');
    
    setupFormHandlers();
    setupPhotoUpload();
    setupThemeToggle();
    setupSearch();
    setupModalHandlers();
    
    // Load data
    loadComplaints();
    loadAdminTable();
    loadStatistics();
    setupAutoRefresh();
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    showNotification('App initialization error. Check console.', 'error');
  }
}

// ========================================
// NOTIFICATIONS
// ========================================

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  const bgColor = {
    success: 'bg-green-600/20 border-green-600 text-green-400',
    error: 'bg-red-600/20 border-red-600 text-red-400',
    warning: 'bg-yellow-600/20 border-yellow-600 text-yellow-400',
    info: 'bg-blue-600/20 border-blue-600 text-blue-400'
  }[type] || 'bg-blue-600/20 border-blue-600 text-blue-400';

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${bgColor} border rounded-lg px-6 py-3 z-50 shadow-lg animate-pulse max-w-sm`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

function showMessage(message, type) {
  const responseMessage = safeGetById('responseMessage');
  if (!responseMessage) {
    console.warn('⚠️ responseMessage element not found, using notification');
    showNotification(message, type);
    return;
  }

  responseMessage.textContent = message;
  responseMessage.classList.remove('hidden');

  if (type === 'success') {
    responseMessage.className = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-center font-bold p-3 rounded-lg';
  } else {
    responseMessage.className = 'bg-red-500/20 text-red-400 border border-red-500/20 text-center font-bold p-3 rounded-lg';
  }

  setTimeout(() => {
    responseMessage.classList.add('hidden');
  }, 5000);
}

// ========================================
// THEME TOGGLE
// ========================================

function setupThemeToggle() {
  try {
    const toggle = safeGetById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    applyTheme(savedTheme);

    if (toggle) {
      safeAddEventListener(toggle, 'click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  } catch (error) {
    console.error('❌ Theme toggle setup error:', error);
  }
}

function applyTheme(theme) {
  try {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = safeGetById('themeToggle');
    if (toggle) {
      toggle.innerHTML = theme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    }
  } catch (error) {
    console.error('❌ Apply theme error:', error);
  }
}

// ========================================
// PHOTO UPLOAD
// ========================================

function setupPhotoUpload() {
  try {
    const photoInput = safeGetById('photoUpload');
    if (!photoInput) {
      console.warn('⚠️ Photo upload not available');
      return;
    }

    const photoLabel = photoInput.parentElement;
    const removeBtn = safeGetById('removePhoto');

    if (photoLabel) {
      photoLabel.addEventListener('click', () => {
        photoInput.click();
      });
    }

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          photoData = event.target.result;
          const previewImage = safeGetById('previewImage');
          const photoPreview = safeGetById('photoPreview');
          
          if (previewImage) previewImage.src = photoData;
          if (photoPreview) photoPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      } else {
        showNotification('File size must be less than 5MB', 'warning');
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        photoData = null;
        photoInput.value = '';
        const photoPreview = safeGetById('photoPreview');
        if (photoPreview) photoPreview.classList.add('hidden');
      });
    }
  } catch (error) {
    console.error('❌ Photo upload setup error:', error);
  }
}

// ========================================
// FORM HANDLERS
// ========================================

function setupFormHandlers() {
  try {
    const form = safeGetById('complaintForm');
    if (form) {
      safeAddEventListener(form, 'submit', (e) => {
        e.preventDefault();
        submitComplaint();
      });
    } else {
      console.warn('⚠️ Complaint form not found');
    }
  } catch (error) {
    console.error('❌ Form handler setup error:', error);
  }
}

async function submitComplaint() {
  try {
    // Must be signed in (complaints are tied to the citizen's account).
    if (window.AUTH && !window.AUTH.isAuthenticated()) {
      showMessage('Please sign in with Google (top-right) to file a complaint.', 'error');
      return;
    }

    const fullName = safeGetValue('fullName');
    const wardNumber = safeGetValue('wardNumber');
    const category = safeGetValue('category');
    const severity = safeGetValue('severity') || 'Medium';
    const issue = safeGetValue('issue');

    if (!fullName || !wardNumber || !category || !issue) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    const submitBtn = safeGetById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ SUBMITTING...';
    }

    const payload = {
      id: `complaint_${Date.now()}`,
      fullName,
      wardNumber,
      category,
      severity,
      issue,
      photoUrl: photoData || null,
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };

    try {
      // Try API first with HTTP client (includes retries and error handling)
      await HTTP.post(
        `${API_URL}/complaints`,
        payload,
        'submitBtn'
      );

      showMessage('✓ Report submitted successfully!', 'success');
      resetComplaintForm();
      loadComplaints();
      loadStatistics();
      loadAdminTable();
    } catch (apiError) {
      console.warn('⚠️ API failed, trying N8N webhook...', apiError.message);
      
      try {
        // Fallback to N8N with HTTP client
        await HTTP.post(
          N8N_WEBHOOK,
          payload,
          'submitBtn'
        );

        showMessage('✓ Report submitted via webhook!', 'success');
        resetComplaintForm();
        loadComplaints();
      } catch (webhookError) {
        console.error('❌ Both API and webhook failed:', webhookError.message);
        // Save to localStorage as final fallback
        saveToLocalStorage(payload);
        showMessage('✓ Report saved locally. Will sync when online.', 'warning');
        resetComplaintForm();
      }
    }
  } catch (error) {
    console.error('❌ Submit complaint error:', error);
    showMessage('Error submitting complaint. Please try again.', 'error');
  } finally {
    const submitBtn = safeGetById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT COMPLAINT';
    }
  }
}

function resetComplaintForm() {
  const form = safeGetById('complaintForm');
  if (form) form.reset();
  
  photoData = null;
  const photoPreview = safeGetById('photoPreview');
  if (photoPreview) photoPreview.classList.add('hidden');
}

function saveToLocalStorage(complaint) {
  try {
    const stored = JSON.parse(localStorage.getItem('complaints') || '[]');
    stored.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(stored));
    console.log('💾 Complaint saved to localStorage');
  } catch (error) {
    console.error('❌ localStorage save error:', error);
  }
}

// ========================================
// COMPLAINTS LOADING & DISPLAY
// ========================================

async function loadComplaints() {
  try {
    const container = safeGetById('complaintsContainer');
    if (!container) return;

    try {
      // PUBLIC feed — anyone can see every complaint (anonymized, no names).
      // No login required to view.
      allComplaints = await HTTP.get(`${API_URL}/complaints/public`, 'complaintsContainer');
    } catch (error) {
      console.warn('⚠️ API failed, loading from localStorage:', error.message);
      allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      showNotification('Using cached data (API unavailable)', 'warning');
    }

    displayComplaints(allComplaints);
  } catch (error) {
    console.error('❌ Load complaints error:', error);
    showNotification('Error loading complaints', 'error');
  }
}

function displayComplaints(complaints) {
  const container = safeGetById('complaintsContainer');
  if (!container) return;

  if (!complaints || complaints.length === 0) {
    container.innerHTML = `
      <div class="glass rounded-2xl p-6 border border-white/5 text-center py-12 md:col-span-2 lg:col-span-3">
        <i class="fa-solid fa-inbox text-4xl text-slate-500 mb-4"></i>
        <p class="text-slate-400">No complaints yet. Be the first to report an issue!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = complaints.map((complaint) => {
    const statusColor = complaint.status === 'Pending' ? 'yellow' 
      : complaint.status === 'In Progress' ? 'blue' 
      : 'emerald';
    const severityColor = complaint.severity === 'High' ? 'red' 
      : complaint.severity === 'Medium' ? 'amber' 
      : 'green';
    const categoryIcon = {
      'Road & Infrastructure': '🛣️',
      'Water Supply': '💧',
      'Electricity': '⚡',
      'Sanitation': '🧹',
      'Public Services': '🏛️',
      'Other': '📝',
    }[complaint.category] || '📝';

    const createdDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `
      <div class="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all complaint-item" data-status="${(complaint.status || 'pending').toLowerCase()}">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">${categoryIcon}</span>
              <span class="px-2 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-bold rounded">${escapeHtml(complaint.category)}</span>
            </div>
            <h3 class="text-white font-bold text-lg mb-1">${escapeHtml(complaint.category || 'Complaint')}</h3>
            <p class="text-slate-400 text-sm"><i class="fa-solid fa-map-pin text-purple-500 mr-2"></i>${escapeHtml(complaint.wardNumber || '')}</p>
          </div>
          <div class="flex flex-col gap-2">
            <span class="px-3 py-1 bg-${statusColor}-500/10 text-${statusColor}-400 text-[10px] font-black uppercase rounded-full border border-${statusColor}-500/20 whitespace-nowrap text-center">
              ${complaint.status || 'Pending'}
            </span>
            <span class="px-3 py-1 bg-${severityColor}-500/10 text-${severityColor}-400 text-[10px] font-black uppercase rounded-full border border-${severityColor}-500/20 whitespace-nowrap text-center">
              ${complaint.severity}
            </span>
          </div>
        </div>
        
        <p class="text-slate-300 text-sm mb-4 leading-relaxed">${escapeHtml(complaint.issue)}</p>
        
        ${complaint.photoUrl ? `<img src="${complaint.photoUrl}" alt="Issue photo" class="w-full rounded-lg mb-4 max-h-48 object-cover border border-white/10">` : ''}
        
        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <p class="text-[10px] text-slate-500"><i class="fa-solid fa-calendar mr-1"></i>${createdDate}</p>
          <p class="text-[10px] text-slate-600 font-mono">ID: ${complaint.id}</p>
        </div>
      </div>
    `;
  }).join('');
}

function filterComplaints(status) {
  try {
    const buttons = document.querySelectorAll('button[id^="filter-"]');
    const items = document.querySelectorAll('.complaint-item');

    buttons.forEach((btn) => {
      btn.classList.remove('tab-active', 'text-white');
      btn.classList.add('text-slate-400');
    });

    const activeBtn = safeGetById(`filter-${status}`);
    if (activeBtn) {
      activeBtn.classList.add('tab-active', 'text-white');
    }

    items.forEach((item) => {
      if (status === 'all') {
        item.style.display = 'block';
      } else if (item.dataset.status === status) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('❌ Filter complaints error:', error);
  }
}

// ========================================
// STATISTICS
// ========================================

function loadStatistics() {
  try {
    if (allComplaints.length === 0) {
      safeSetText('statTotal', '0');
      safeSetText('statPending', '0');
      safeSetText('statResolved', '0');
      safeSetText('statRate', '0%');
      return;
    }

    const total = allComplaints.length;
    const pending = allComplaints.filter((c) => c.status === 'Pending').length;
    const resolved = allComplaints.filter((c) => c.status === 'Resolved').length;
    const rate = Math.round((resolved / total) * 100);

    safeSetText('statTotal', String(total));
    safeSetText('statPending', String(pending));
    safeSetText('statResolved', String(resolved));
    safeSetText('statRate', `${rate}%`);

    // Category distribution
    const categoryCount = {};
    allComplaints.forEach((c) => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });

    const categoryHTML = Object.entries(categoryCount)
      .map(([cat, count]) => `
        <div class="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <span class="text-slate-300">${escapeHtml(cat)}</span>
          <span class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-bold">${count}</span>
        </div>
      `).join('');

    safeSetHtml('categoryStats', categoryHTML);
  } catch (error) {
    console.error('❌ Load statistics error:', error);
  }
}

// ========================================
// ADMIN DASHBOARD
// ========================================

function loadAdminTable() {
  try {
    const tbody = safeGetById('adminTableBody');
    if (!tbody) return;

    if (allComplaints.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-500">No complaints yet</td></tr>';
      return;
    }

    tbody.innerHTML = allComplaints.map((complaint) => {
      const date = new Date(complaint.createdAt).toLocaleDateString('en-US');
      return `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
          <td class="px-4 py-3 text-slate-300 font-mono text-xs">${complaint.id}</td>
          <td class="px-4 py-3 text-slate-300">${escapeHtml(complaint.fullName)}</td>
          <td class="px-4 py-3 text-slate-300">${escapeHtml(complaint.category)}</td>
          <td class="px-4 py-3">
            <span class="text-xs font-bold ${
              complaint.severity === 'High' ? 'text-red-400' 
              : complaint.severity === 'Medium' ? 'text-yellow-400' 
              : 'text-green-400'
            }">
              ${complaint.severity}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class="text-xs px-2 py-1 rounded ${
              complaint.status === 'Resolved' ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
            }">
              ${complaint.status || 'Pending'}
            </span>
          </td>
          <td class="px-4 py-3 text-slate-400 text-xs">${date}</td>
          <td class="px-4 py-3">
            <button onclick="openUpdateModal('${complaint.id}')" class="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors">
              Update
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('❌ Load admin table error:', error);
  }
}

function openUpdateModal(id) {
  try {
    const updateId = safeGetById('updateId');
    const updateModal = safeGetById('updateModal');
    
    if (updateId) updateId.value = id;
    if (updateModal) updateModal.classList.add('active');
  } catch (error) {
    console.error('❌ Open update modal error:', error);
  }
}

function closeUpdateModal() {
  try {
    const updateModal = safeGetById('updateModal');
    if (updateModal) updateModal.classList.remove('active');
  } catch (error) {
    console.error('❌ Close update modal error:', error);
  }
}

async function saveStatusUpdate() {
  try {
    const id = safeGetValue('updateId');
    const newStatus = safeGetValue('updateStatus');
    const note = safeGetValue('updateNote');

    if (!id || !newStatus) {
      showNotification('Please select a status', 'warning');
      return;
    }

    const response = await HTTP.put(
      `${API_URL}/complaints/${id}`,
      { status: newStatus, note },
      'updateModal'
    );

    showNotification('✓ Status updated successfully!', 'success');
    closeUpdateModal();
    loadComplaints();
    loadAdminTable();
    loadStatistics();
  } catch (error) {
    console.error('❌ Save status update error:', error);
    showNotification('Error updating status: ' + error.message, 'error');
  }
}

// ========================================
// SEARCH & EXPORT
// ========================================

function setupSearch() {
  try {
    const searchInput = safeGetById('searchComplaints');
    if (!searchInput) return;

    safeAddEventListener(searchInput, 'input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#adminTableBody tr');

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  } catch (error) {
    console.error('❌ Setup search error:', error);
  }
}

function exportComplaintsCSV() {
  try {
    if (allComplaints.length === 0) {
      showNotification('No complaints to export', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Ward', 'Category', 'Severity', 'Status', 'Date', 'Issue'];
    const rows = allComplaints.map((c) => [
      c.id,
      c.fullName,
      c.wardNumber,
      c.category,
      c.severity,
      c.status || 'Pending',
      new Date(c.createdAt).toLocaleDateString(),
      c.issue,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('✓ Complaints exported successfully!', 'success');
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    showNotification('Error exporting complaints', 'error');
  }
}

// ========================================
// MODAL HANDLERS
// ========================================

function setupModalHandlers() {
  try {
    document.addEventListener('click', (e) => {
      const updateModal = safeGetById('updateModal');
      if (updateModal && e.target === updateModal) {
        closeUpdateModal();
      }
    });
  } catch (error) {
    console.error('❌ Setup modal handlers error:', error);
  }
}

// ========================================
// UTILITIES
// ========================================

function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function setupAutoRefresh() {
  try {
    setInterval(() => {
      loadComplaints();
      loadStatistics();
      loadAdminTable();
    }, 10000);
  } catch (error) {
    console.error('❌ Setup auto refresh error:', error);
  }
}

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================

window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled rejection:', event.reason);
});

console.log('✅ app-safe.js loaded successfully');
