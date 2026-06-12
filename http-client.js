// ========================================
// HTTP CLIENT WITH ADVANCED ERROR HANDLING
// ========================================
// Provides robust fetch wrapper with retries, validation, and user feedback

class HTTPClient {
  constructor(config = {}) {
    this.timeout = config.timeout || 15000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    this.requestQueue = [];
    this.activeRequests = new Map();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    console.log('✅ HTTPClient initialized');
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Function that receives request config
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Function that receives response
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Show loading state
   * @param {string} elementId - Element ID to show loading spinner
   * @param {boolean} show - Show or hide
   */
  setLoadingState(elementId, show = true) {
    if (!elementId) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    if (show) {
      element.classList.add('is-loading');
      element.disabled = true;
      const originalHTML = element.innerHTML;
      element.dataset.originalHTML = originalHTML;
      element.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i>Loading...';
    } else {
      element.classList.remove('is-loading');
      element.disabled = false;
      if (element.dataset.originalHTML) {
        element.innerHTML = element.dataset.originalHTML;
        delete element.dataset.originalHTML;
      }
    }
  }

  /**
   * Format error message for user
   * @param {Error|Response|string} error - The error
   * @returns {string} - User-friendly error message
   */
  formatErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Response) {
      const statusMessages = {
        400: 'Invalid request. Please check your input.',
        401: 'Authentication required. Please log in.',
        403: 'You do not have permission to perform this action.',
        404: 'The resource was not found.',
        408: 'Request timeout. Please try again.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Server error. Please try again later.',
        502: 'Service temporarily unavailable. Please try again.',
        503: 'Service is under maintenance. Please try again later.',
        504: 'Gateway timeout. Please try again.',
      };
      return statusMessages[error.status] || `HTTP Error ${error.status}`;
    }

    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        return 'Network error. Please check your connection.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timeout. Please try again.';
      }
      return `Network error: ${error.message}`;
    }

    if (error instanceof Error) {
      return error.message || 'An unexpected error occurred.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Validate response
   * @param {Response} response - Fetch response
   * @returns {Object} - { valid: boolean, error: string }
   */
  validateResponse(response) {
    if (!response) {
      return { valid: false, error: 'No response received' };
    }

    if (!(response instanceof Response)) {
      return { valid: false, error: 'Invalid response object' };
    }

    if (response.status < 200 || response.status >= 300) {
      return {
        valid: false,
        error: this.formatErrorMessage(response),
        retryable: this.retryableStatusCodes.includes(response.status)
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { valid: false, error: 'Invalid response format' };
    }

    return { valid: true };
  }

  /**
   * Validate JSON response body
   * @param {any} data - Parsed JSON data
   * @param {string} endpoint - API endpoint (for logging)
   * @returns {Object} - { valid: boolean, error: string }
   */
  validateResponseBody(data, endpoint = '') {
    if (data === null || data === undefined) {
      return { valid: false, error: 'Response body is empty' };
    }

    // Allow both objects and arrays
    if (typeof data !== 'object') {
      return { valid: false, error: 'Response is not valid JSON' };
    }

    // If it's an error response, check for error field
    if (data.error && !data.success) {
      return { valid: false, error: data.error };
    }

    return { valid: true };
  }

  /**
   * Create timeout promise
   * @param {number} ms - Milliseconds
   * @returns {Promise} - Rejects after timeout
   */
  createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Delay execution (for retries)
   * @param {number} ms - Milliseconds
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retries and error handling
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {string} loadingElementId - Element ID for loading state
   * @returns {Promise<any>} - Response data
   */
  async request(url, options = {}, loadingElementId = null) {
    if (!url) {
      throw new Error('URL is required');
    }

    const method = options.method || 'GET';
    const requestId = `${method} ${url} ${Date.now()}`;
    let attempt = 0;

    try {
      // Show loading state
      this.setLoadingState(loadingElementId, true);
      this.activeRequests.set(requestId, { url, method, started: Date.now() });

      console.log(`📤 [${method}] ${url}`);

      // Retry loop
      while (attempt < this.retryAttempts) {
        try {
          // Apply request interceptors
          let finalOptions = { ...options };
          for (const interceptor of this.requestInterceptors) {
            finalOptions = await interceptor(finalOptions);
          }

          // Set default headers
          if (!finalOptions.headers) {
            finalOptions.headers = {};
          }
          finalOptions.headers['Content-Type'] = 'application/json';

          // Make request with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);

          const response = await Promise.race([
            fetch(url, {
              ...finalOptions,
              signal: controller.signal
            }),
            this.createTimeoutPromise(this.timeout)
          ]);

          clearTimeout(timeoutId);

          // Validate response
          const validation = this.validateResponse(response);
          if (!validation.valid) {
            const error = new Error(validation.error);
            error.status = response.status;
            error.retryable = validation.retryable;
            throw error;
          }

          // Parse response
          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            throw new Error('Invalid response format');
          }

          // Validate response body
          const bodyValidation = this.validateResponseBody(data, url);
          if (!bodyValidation.valid) {
            throw new Error(bodyValidation.error);
          }

          // Apply response interceptors
          for (const interceptor of this.responseInterceptors) {
            data = await interceptor(data);
          }

          console.log(`✅ [${method}] ${url} (${Date.now() - this.activeRequests.get(requestId).started}ms)`);

          // Hide loading state
          this.setLoadingState(loadingElementId, false);

          return data;

        } catch (error) {
          attempt++;
          const isRetryable = error.retryable !== false && 
                            (this.retryableStatusCodes.includes(error.status) || 
                             error.message.includes('timeout') ||
                             error.message.includes('Network'));

          console.warn(`⚠️ Attempt ${attempt}/${this.retryAttempts}: ${error.message}`);

          if (attempt < this.retryAttempts && isRetryable) {
            const delayMs = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`⏳ Retrying in ${delayMs}ms...`);
            await this.delay(delayMs);
          } else {
            throw error;
          }
        }
      }

    } catch (error) {
      console.error(`❌ [${method}] ${url}: ${error.message}`);
      this.setLoadingState(loadingElementId, false);
      throw error;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {string} loadingElementId - Loading state element
   * @returns {Promise<any>}
   */
  async get(url, loadingElementId = null) {
    return this.request(url, { method: 'GET' }, loadingElementId);
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {any} data - Request body
   * @param {string} loadingElementId - Loading state element
   * @returns {Promise<any>}
   */
  async post(url, data = {}, loadingElementId = null) {
    return this.request(
      url,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      loadingElementId
    );
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {any} data - Request body
   * @param {string} loadingElementId - Loading state element
   * @returns {Promise<any>}
   */
  async put(url, data = {}, loadingElementId = null) {
    return this.request(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      loadingElementId
    );
  }

  /**
   * PATCH request
   * @param {string} url - Request URL
   * @param {any} data - Request body
   * @param {string} loadingElementId - Loading state element
   * @returns {Promise<any>}
   */
  async patch(url, data = {}, loadingElementId = null) {
    return this.request(
      url,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      loadingElementId
    );
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {string} loadingElementId - Loading state element
   * @returns {Promise<any>}
   */
  async delete(url, loadingElementId = null) {
    return this.request(url, { method: 'DELETE' }, loadingElementId);
  }

  /**
   * Get active requests count
   * @returns {number}
   */
  getActiveRequestCount() {
    return this.activeRequests.size;
  }

  /**
   * Get active requests
   * @returns {Array}
   */
  getActiveRequests() {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Cancel all requests
   */
  cancelAllRequests() {
    console.log(`🛑 Cancelling ${this.activeRequests.size} active requests`);
    this.activeRequests.clear();
  }
}

// ========================================
// INITIALIZE GLOBAL HTTP CLIENT
// ========================================

const HTTP = new HTTPClient({
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000
});

// Make globally available
window.HTTP = HTTP;

console.log('✅ HTTPClient loaded and available as window.HTTP');
