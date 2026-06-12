# 🔧 Environment Configuration Guide

## Overview

The Pachtaki Yadu portal now uses dynamic, environment-safe API configuration that automatically detects whether you're running in **development** or **production** mode.

---

## 🎯 Key Features

✅ **Automatic Environment Detection**
- Detects localhost vs. production automatically
- Supports network development (192.168.x.x, 10.x.x.x)
- Works with Vercel, local servers, and custom domains

✅ **Dynamic API URL Selection**
- **Development**: Uses `http://localhost:3000/api` (or network IP)
- **Production**: Uses relative paths `/api` (same domain)

✅ **Fallback Mechanisms**
- N8N Cloud webhook as primary backend
- Local API as fallback
- LocalStorage as final backup

✅ **Environment Variables Support**
- `VITE_N8N_WEBHOOK_URL` - Custom N8N webhook URL
- `window.__ENV__` - Server-injected variables
- `localStorage` - Runtime overrides

✅ **Validation & Testing**
- Built-in connectivity check
- Console logging with clear diagnostics
- Easy URL override for testing

---

## 📁 Configuration Files

### `config.js` - Environment Detection & Setup
Located at: `/Users/panka/Pachtaki Yadu project/config.js`

**Responsibilities:**
- Detect environment (development/production)
- Configure API endpoints
- Set webhook URLs
- Validate connectivity
- Provide environment helpers

**Global Functions Available:**
```javascript
CONFIG.getAPIUrl(endpoint)        // Get API URL for endpoint
CONFIG.getWebhookUrl(type)        // Get webhook URL (n8n, local)
CONFIG.getConfig()                // Get full configuration
CONFIG.validateConnectivity()     // Check if API is reachable
CONFIG.setCustomAPIUrl(url)       // Override API URL
CONFIG.setCustomWebhookUrl(type, url)  // Override webhook URL
```

### `app-safe.js` - Application Logic
Located at: `/Users/panka/Pachtaki Yadu project/app-safe.js`

**Responsibilities:**
- Use CONFIG for API URLs
- Handle form submissions
- Display complaints
- Manage state

**Changes Made:**
- Replaced hardcoded `API_URL` with `CONFIG.getAPIUrl()`
- Replaced hardcoded `N8N_WEBHOOK` with `CONFIG.getWebhookUrl('n8n')`

### `index.html` - HTML Entry Point
Located at: `/Users/panka/Pachtaki Yadu project/index.html`

**Script Loading Order (IMPORTANT!):**
```html
<!-- Configuration must load FIRST -->
<script src="config.js"></script>

<!-- Application loads AFTER config -->
<script src="app-safe.js"></script>
```

---

## 🌍 Environment Detection Logic

### Development Mode
Detected when:
- `hostname === 'localhost'`
- `hostname === '127.0.0.1'`
- `hostname === '::1'` (IPv6 localhost)
- `hostname.startsWith('192.168.')` (private network)
- `hostname.startsWith('10.')` (private network)
- `hostname.includes('.local')` (mDNS)
- `hostname.includes('.dev')` (development domain)

**API URL:** `http://192.168.x.x:3000/api` or `http://localhost:3000/api`

### Production Mode
Used when:
- Running on any other hostname (e.g., Vercel domain)
- Not matching development patterns

**API URL:** `/api` (relative, same domain)

---

## 🚀 Usage Scenarios

### 1. Local Development
```
URL: http://localhost:3000
↓ Config detects: localhost
↓ Sets API_URL to: http://localhost:3000/api
↓ App works with local backend
```

**Start Command:**
```bash
npm start  # Starts backend on :3000
# Open http://localhost:3000 in browser
```

### 2. Network Development (Multi-Device)
```
URL: http://192.168.1.100:3000
↓ Config detects: 192.168.* (private network)
↓ Sets API_URL to: http://192.168.1.100:3000/api
↓ App works on other devices
```

**Start Command:**
```bash
npm start  # Starts backend on :3000
# Access from other device: http://192.168.1.100:3000
```

### 3. Production (Vercel)
```
URL: https://pachtaki-yadu.vercel.app
↓ Config detects: vercel.app domain (production)
↓ Sets API_URL to: /api
↓ Backend on same domain as frontend
```

**Deploy:**
```bash
git push origin main  # Auto-deploys to Vercel
# Access: https://pachtaki-yadu.vercel.app
```

### 4. Custom Domain
```
URL: https://pachtaki-yadu.com
↓ Config detects: Not localhost/192.168/10. (production)
↓ Sets API_URL to: /api
↓ Backend on same domain
```

---

## 🔌 Webhook Configuration

### N8N Cloud Webhook
**URL:** `https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5`

**Used for:**
- Production complaint submissions
- Webhook-based backend
- Cloud data processing

**Override via Environment Variable:**
```javascript
// In .env file (Vite):
VITE_N8N_WEBHOOK_URL=https://your-custom-n8n-url

// In server (Node.js):
window.__ENV__ = {
  'VITE_N8N_WEBHOOK_URL': 'https://your-custom-n8n-url'
}

// At runtime (localStorage):
localStorage.setItem('env_VITE_N8N_WEBHOOK_URL', 'https://custom-url')
CONFIG.setCustomWebhookUrl('n8n', 'https://custom-url')
```

---

## 🧪 Testing & Validation

### 1. Check Configuration in Browser Console
```javascript
// Open DevTools Console and run:
CONFIG                  // View full config object
CONFIG.isDevelopment    // true/false
CONFIG.isProduction     // true/false
CONFIG.getAPIUrl()      // Get current API URL
CONFIG.getWebhookUrl('n8n')  // Get N8N webhook URL
```

### 2. Validate API Connectivity
```javascript
// In browser console:
await CONFIG.validateConnectivity()
// Returns: true if API reachable, false if not
```

### 3. View Configuration Logs
```javascript
// Open DevTools Console
// On page load, you'll see:
🔧 Environment Configuration
🌍 Hostname: localhost
🔗 Protocol: http:
🏪 Environment: DEVELOPMENT
📍 Localhost: YES
📡 API Base URL: http://localhost:3000/api
⏱️  API Timeout: 10000ms
🔄 Retry Attempts: 3
🔗 N8N Webhook: https://pankajkumar8454.app.n8n.cloud/...
```

### 4. Override API URL for Testing
```javascript
// In browser console:
CONFIG.setCustomAPIUrl('http://my-test-server:3000/api')
// All subsequent API calls will use this URL

// Reset to default:
CONFIG.resetConfiguration()
```

---

## 🔐 Environment Variables

### For Development (.env.local)
```env
# Local development
VITE_API_URL=http://localhost:3000/api
VITE_N8N_WEBHOOK_URL=https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5
```

### For Production (.env.production)
```env
# Production deployment
VITE_API_URL=/api
VITE_N8N_WEBHOOK_URL=https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5
```

### For Vercel Deployment
In Vercel Dashboard:
```
Settings → Environment Variables

VITE_API_URL=/api
VITE_N8N_WEBHOOK_URL=https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5
```

---

## 🛠️ Common Issues & Solutions

### Issue: "API is unreachable"
**Cause:** Backend server not running on port 3000

**Solution:**
```bash
# Make sure backend is running:
npm start

# Or check if port is in use:
lsof -i :3000

# Verify in browser console:
await CONFIG.validateConnectivity()
```

### Issue: CORS Errors in Console
**Cause:** Development API accessed from different domain

**Solution:**
```javascript
// The config already handles this:
// - Localhost → http://localhost:3000/api (same port)
// - Network IP → http://192.168.x.x:3000/api (same port)
// - Production → /api (same domain)
```

### Issue: Wrong API URL Being Used
**Cause:** Environment detection failed

**Solution:**
```javascript
// Check what's detected:
CONFIG.isDevelopment  // Should be true for localhost
CONFIG.isProduction   // Should be true for vercel.app

// Force correct URL:
CONFIG.setCustomAPIUrl('http://localhost:3000/api')
```

### Issue: N8N Webhook Not Working
**Cause:** Webhook URL incorrect or N8N service down

**Solution:**
```javascript
// Check webhook URL:
CONFIG.getWebhookUrl('n8n')

// Test webhook:
fetch(CONFIG.getWebhookUrl('n8n'), {
  method: 'POST',
  body: JSON.stringify({ test: true })
})

// Override if needed:
CONFIG.setCustomWebhookUrl('n8n', 'https://new-webhook-url')
```

---

## 📊 Configuration Priority Order

1. **LocalStorage** (highest priority - runtime override)
   ```javascript
   localStorage.getItem('env_VITE_N8N_WEBHOOK_URL')
   ```

2. **window.__ENV__** (server-injected variables)
   ```javascript
   window.__ENV__.VITE_N8N_WEBHOOK_URL
   ```

3. **Hardcoded defaults** (lowest priority)
   ```javascript
   'https://pankajkumar8454.app.n8n.cloud/form/...'
   ```

---

## 🎯 API Endpoint Configuration

### Development
```javascript
// Base URL:
http://localhost:3000/api

// Endpoints:
GET    /api/complaints              // Get all complaints
POST   /api/complaints              // Create complaint
PUT    /api/complaints/:id          // Update complaint
GET    /api/health                  // Health check
```

### Production
```javascript
// Base URL:
/api  (relative to domain)

// Endpoints:
GET    /api/complaints
POST   /api/complaints
PUT    /api/complaints/:id
GET    /api/health
```

---

## 🚀 Deployment Checklist

- [ ] `config.js` is loaded before `app-safe.js`
- [ ] Environment variables set in `.env` files
- [ ] Backend API running (for development)
- [ ] N8N webhook URL configured
- [ ] `CONFIG.validateConnectivity()` returns true
- [ ] Console shows correct environment (DEVELOPMENT/PRODUCTION)
- [ ] API URL matches environment
- [ ] Webhook URL is accessible

---

## 📝 Script Load Order (Critical!)

**MUST be in this order:**

```html
<!-- 1. Load configuration FIRST (sets up CONFIG global) -->
<script src="config.js"></script>

<!-- 2. Load app SECOND (uses CONFIG) -->
<script src="app-safe.js"></script>
```

**Why?**
- `config.js` creates the `CONFIG` global object
- `app-safe.js` depends on `CONFIG` being available
- If order is reversed, `CONFIG` will be undefined and app will break

---

## 💡 Best Practices

1. **Always check environment in console**
   ```javascript
   CONFIG.isDevelopment
   ```

2. **Use relative paths in production**
   ```javascript
   // Instead of hardcoding domain:
   // ✗ http://example.com/api/complaints
   // ✓ /api/complaints
   ```

3. **Never commit hardcoded URLs**
   ```javascript
   // ✗ const API_URL = 'http://192.168.1.100:3000/api'
   // ✓ const API_URL = CONFIG.getAPIUrl()
   ```

4. **Use environment variables for secrets**
   ```javascript
   // .env.local (git-ignored)
   VITE_N8N_WEBHOOK_URL=https://secret-webhook-url
   ```

5. **Test connectivity before production**
   ```javascript
   await CONFIG.validateConnectivity()
   ```

---

## 🎉 You're Ready!

Your app now has:
- ✅ Automatic environment detection
- ✅ Dynamic API URL configuration
- ✅ Support for development and production
- ✅ Webhook configuration
- ✅ Environment variables support
- ✅ Runtime URL override capability
- ✅ Connectivity validation
- ✅ Clear console logging

**The app works seamlessly in any environment!** 🚀
