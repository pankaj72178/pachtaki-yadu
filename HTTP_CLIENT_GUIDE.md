# 🚀 HTTP Client with Advanced Error Handling

## Overview

The `http-client.js` provides a robust, production-ready HTTP client with comprehensive error handling, automatic retries, loading states, and user-friendly error messages.

---

## 🎯 Key Features

✅ **Automatic Retries**
- Exponential backoff strategy (1s, 2s, 4s, 8s...)
- Configurable retry attempts (default: 3)
- Smart retry logic for specific status codes (408, 429, 500, 502, 503, 504)

✅ **Request/Response Lifecycle**
- Request interceptors for preprocessing
- Response interceptors for post-processing
- Timeout protection (default: 15 seconds)
- Request tracking and monitoring

✅ **Loading States**
- Automatic button/element loading states
- Disabled state during request
- Spinner animation
- Original HTML restoration

✅ **Error Handling**
- Graceful error messages for users
- Network error detection
- Timeout handling
- JSON parsing validation
- Response body validation

✅ **Response Validation**
- HTTP status code validation
- Content-Type checking
- JSON format validation
- Error response detection

---

## 📋 HTTP Client API

### Constructor

```javascript
const httpClient = new HTTPClient({
  timeout: 15000,      // Request timeout in ms
  retryAttempts: 3,    // Number of retry attempts
  retryDelay: 1000     // Initial delay between retries (exponential)
});
```

### Methods

#### GET Request
```javascript
const data = await HTTP.get(
  '/api/complaints',
  'loadingElementId'  // Optional: element to show loading state
);
```

#### POST Request
```javascript
const data = await HTTP.post(
  '/api/complaints',
  { name: 'John', issue: 'Road damage' },
  'submitButtonId'    // Optional: element to show loading state
);
```

#### PUT Request
```javascript
const data = await HTTP.put(
  '/api/complaints/123',
  { status: 'Resolved' },
  'updateButtonId'
);
```

#### PATCH Request
```javascript
const data = await HTTP.patch(
  '/api/complaints/123',
  { status: 'In Progress' }
);
```

#### DELETE Request
```javascript
const data = await HTTP.delete(
  '/api/complaints/123'
);
```

#### Generic Request
```javascript
const data = await HTTP.request(
  '/api/custom',
  {
    method: 'POST',
    body: JSON.stringify({ data: 'value' })
  },
  'loadingElementId'
);
```

---

## 📊 Error Handling

### User-Friendly Error Messages

Status codes are automatically converted to user-friendly messages:

| Status | Message |
|--------|---------|
| 400 | Invalid request. Please check your input. |
| 401 | Authentication required. Please log in. |
| 403 | You do not have permission to perform this action. |
| 404 | The resource was not found. |
| 408 | Request timeout. Please try again. |
| 429 | Too many requests. Please wait a moment. |
| 500 | Server error. Please try again later. |
| 502 | Service temporarily unavailable. Please try again. |
| 503 | Service is under maintenance. Please try again later. |
| 504 | Gateway timeout. Please try again. |

### Network Errors

Network errors are detected and formatted:

```javascript
// Connection failed
// ↓ Shows: "Network error. Please check your connection."

// Timeout
// ↓ Shows: "Request timeout. Please try again."

// Invalid JSON response
// ↓ Shows: "Invalid response format"
```

### Retry Logic

```javascript
// Request fails with 503 (Service Unavailable)
// ↓ Automatic retry after 1 second
// ↓ Retry fails with 503 again
// ↓ Automatic retry after 2 seconds
// ↓ Retry fails with 503 again
// ↓ Automatic retry after 4 seconds
// ↓ All retries exhausted
// ↓ Error thrown to application
```

---

## 💡 Loading States

### Automatic Button Loading

```javascript
// Before request
<button id="submitBtn">SUBMIT</button>

// During request
<button id="submitBtn" disabled class="is-loading">
  <i class="fa-solid fa-spinner animate-spin mr-2"></i>Loading...
</button>

// After request
<button id="submitBtn">SUBMIT</button>
```

### Usage in Application

```javascript
// Button shows loading state during request
await HTTP.post(
  '/api/complaints',
  formData,
  'submitBtn'  // Pass button ID for loading state
);

// Button automatically reverts to normal state
```

---

## 🔄 Request/Response Interceptors

### Adding Request Interceptor

```javascript
// Add custom headers to all requests
HTTP.addRequestInterceptor((config) => {
  config.headers = config.headers || {};
  config.headers['X-Custom-Header'] = 'value';
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});
```

### Adding Response Interceptor

```javascript
// Process response before returning
HTTP.addResponseInterceptor((data) => {
  // Transform data if needed
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }
  return data;
});
```

---

## 📋 Request Monitoring

### Get Active Request Count

```javascript
const count = HTTP.getActiveRequestCount();
console.log(`${count} requests in progress`);
```

### Get Active Requests

```javascript
const requests = HTTP.getActiveRequests();
// [
//   { url: '/api/complaints', method: 'GET', started: 1234567890 },
//   { url: '/api/upload', method: 'POST', started: 1234567900 }
// ]
```

### Cancel All Requests

```javascript
HTTP.cancelAllRequests();
```

---

## 🔧 Configuration Options

### Default Configuration

```javascript
const HTTP = new HTTPClient({
  timeout: 15000,         // 15 seconds
  retryAttempts: 3,       // Retry up to 3 times
  retryDelay: 1000        // Start with 1 second delay
});
```

### Custom Configuration

```javascript
// For fast network
const httpFast = new HTTPClient({
  timeout: 5000,          // 5 seconds
  retryAttempts: 2,       // Retry 2 times
  retryDelay: 500         // Start with 500ms delay
});

// For slow network
const httpSlow = new HTTPClient({
  timeout: 30000,         // 30 seconds
  retryAttempts: 5,       // Retry 5 times
  retryDelay: 2000        // Start with 2 second delay
});
```

---

## 📝 Console Output Examples

### Successful Request
```
📤 [GET] /api/complaints
✅ [GET] /api/complaints (245ms)
```

### Failed Request with Retry
```
📤 [POST] /api/complaints
⚠️ Attempt 1/3: Request timeout after 15000ms
⏳ Retrying in 1000ms...
⚠️ Attempt 2/3: Request timeout after 15000ms
⏳ Retrying in 2000ms...
✅ [POST] /api/complaints (35450ms)
```

### All Retries Exhausted
```
📤 [POST] /api/complaints
⚠️ Attempt 1/3: HTTP Error 503
⏳ Retrying in 1000ms...
⚠️ Attempt 2/3: HTTP Error 503
⏳ Retrying in 2000ms...
⚠️ Attempt 3/3: HTTP Error 503
❌ [POST] /api/complaints: HTTP Error 503
```

---

## 🛡️ Error Handling Best Practices

### 1. Always Use Try-Catch

```javascript
try {
  const data = await HTTP.post('/api/complaints', payload, 'submitBtn');
  // Handle success
  showNotification('Success!', 'success');
} catch (error) {
  // Handle error
  const message = error.message || 'An error occurred';
  showNotification(message, 'error');
}
```

### 2. Provide Fallback Data

```javascript
try {
  const complaints = await HTTP.get('/api/complaints');
} catch (error) {
  // Use cached data if available
  const complaints = JSON.parse(
    localStorage.getItem('complaints_cache') || '[]'
  );
}
```

### 3. Show User Feedback

```javascript
// Loading state
showNotification('Submitting...', 'info');

try {
  const result = await HTTP.post('/api/complaints', payload, 'submitBtn');
  // Success
  showNotification('✓ Submitted!', 'success');
} catch (error) {
  // Error
  showNotification('✗ ' + error.message, 'error');
}
```

### 4. Timeout Considerations

```javascript
// For quick operations
const result = await HTTP.post(
  '/api/quick-action',
  data,
  'quickBtn'
);

// For long operations (file upload, processing)
const longHttp = new HTTPClient({ timeout: 60000 });
const result = await longHttp.post(
  '/api/long-operation',
  data,
  'processBtn'
);
```

---

## 🚀 Integration in Application

### How app-safe.js Uses HTTP Client

**Before (Raw Fetch):**
```javascript
try {
  const response = await fetch(`${API_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    // ...
  } else {
    throw new Error('Failed');
  }
} catch (error) {
  // Manual error handling
}
```

**After (HTTP Client):**
```javascript
try {
  await HTTP.post(
    `${API_URL}/complaints`,
    payload,
    'submitBtn'  // Automatic loading state!
  );
  showMessage('✓ Submitted!', 'success');
} catch (error) {
  showMessage('✗ ' + error.message, 'error');
}
```

**Benefits:**
- ✅ Automatic retries on failure
- ✅ Button loading state automatic
- ✅ User-friendly error messages
- ✅ Timeout protection
- ✅ Exponential backoff
- ✅ Better error logging

---

## 🧪 Testing HTTP Client

### Test Successful Request
```javascript
// In browser console:
await HTTP.get('https://jsonplaceholder.typicode.com/todos/1')
// Should return todo object
```

### Test Failed Request with Retry
```javascript
// In browser console:
await HTTP.get('https://invalid-domain-12345.com/api')
// Should show retries and finally error
```

### Test Timeout
```javascript
// Create HTTP client with short timeout
const quickHTTP = new HTTPClient({ timeout: 100 });
await quickHTTP.get('/api/slow-endpoint')
// Should timeout and retry
```

### Test Loading State
```javascript
// Create a button:
// <button id="testBtn">CLICK ME</button>

// Then in console:
setTimeout(() => {
  HTTP.post('/api/test', {}, 'testBtn')
}, 100)

// Button will show loading state for ~15 seconds
```

---

## 📊 Performance Considerations

### Request Timeout Strategy

```
Recommended timeouts:
- Fast operations (< 5s): 10,000ms
- Normal operations (5-15s): 15,000ms (default)
- Slow operations (15-30s): 30,000ms
- Very slow operations (30s+): 60,000ms
```

### Retry Strategy

```
Recommended retries:
- Critical API: 5 retries
- Important API: 3 retries (default)
- Non-critical API: 1-2 retries
```

### Exponential Backoff

```
Retry 1: 1000ms delay
Retry 2: 2000ms delay (1000 * 2)
Retry 3: 4000ms delay (1000 * 2^2)
Retry 4: 8000ms delay (1000 * 2^3)
Retry 5: 16000ms delay (1000 * 2^4)
```

---

## 🎉 You're All Set!

Your app now has:
- ✅ Production-ready HTTP client
- ✅ Automatic retries with exponential backoff
- ✅ Timeout protection
- ✅ User-friendly error messages
- ✅ Loading state management
- ✅ Request/response validation
- ✅ Request interceptors
- ✅ Response interceptors
- ✅ Request monitoring
- ✅ Comprehensive error handling

**The HTTP layer is bulletproof! 🛡️**
