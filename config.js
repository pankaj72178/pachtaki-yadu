// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================
// Dynamically detect environment and set API URLs accordingly

/**
 * Environment detection and configuration
 * Supports:
 * - Local development (localhost:3000)
 * - Network development (192.168.x.x:3000)
 * - Production deployment (Vercel, etc.)
 * - N8N Cloud webhooks
 */

class EnvironmentConfig {
  constructor() {
    this.isDevelopment = this.detectEnvironment();
    this.isLocalhost = this.detectLocalhost();
    this.isProduction = !this.isDevelopment;
    
    this.apiConfig = this.configureAPI();
    this.webhookConfig = this.configureWebhooks();
    
    this.logConfiguration();
  }

  /**
   * Detect if running in development mode
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    // Network development (192.168.x.x, 10.x.x.x)
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return true;
    }
    
    // Development domain indicators
    if (hostname.includes('.local') || hostname.includes('.dev') || hostname.includes('localhost')) {
      return true;
    }
    
    return false;
  }

  /**
   * Detect if running on localhost
   */
  detectLocalhost() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }

  /**
   * Configure API endpoints based on environment
   */
  configureAPI() {
    const protocol = window.location.protocol; // 'http:' or 'https:'
    const hostname = window.location.hostname;
    
    if (this.isDevelopment) {
      // Development: Connect to local/network server on port 3000
      return {
        baseURL: `${protocol}//${hostname}:3000/api`,
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        environment: 'development'
      };
    } else {
      // Production: Use relative paths (same domain)
      return {
        baseURL: '/api',
        timeout: 15000,
        retryAttempts: 2,
        retryDelay: 2000,
        environment: 'production'
      };
    }
  }

  /**
   * Configure webhook endpoints
   */
  configureWebhooks() {
    return {
      n8n: {
        // Production n8n URL - can be overridden via environment variable
        url: this.getEnvVariable('VITE_N8N_WEBHOOK_URL') || 
             'https://pankajkumar8454.app.n8n.cloud/form/42948991-f834-4c85-abe2-9863055e4ea5',
        timeout: 20000,
        environment: 'production'
      },
      local: {
        // Local webhook endpoint (if using n8n locally)
        url: this.isDevelopment 
          ? `${window.location.protocol}//${window.location.hostname}:5678/webhook` 
          : null,
        timeout: 10000,
        environment: 'development'
      }
    };
  }

  /**
   * Get environment variable (from window.__ENV__)
   */
  getEnvVariable(varName) {
    // Try window.__ENV__ (injected by server or build tool)
    if (window.__ENV__ && window.__ENV__[varName]) {
      return window.__ENV__[varName];
    }
    
    // Try localStorage (for settings override)
    const stored = localStorage.getItem(`env_${varName}`);
    if (stored) {
      return stored;
    }
    
    return null;
  }

  /**
   * Get API URL for endpoint
   */
  getAPIUrl(endpoint = '') {
    const baseURL = this.apiConfig.baseURL;
    return endpoint ? `${baseURL}${endpoint}` : baseURL;
  }

  /**
   * Get webhook URL by type
   */
  getWebhookUrl(type = 'n8n') {
    return this.webhookConfig[type]?.url || null;
  }

  /**
   * Get full configuration
   */
  getConfig(key = null) {
    const config = {
      isDevelopment: this.isDevelopment,
      isLocalhost: this.isLocalhost,
      isProduction: this.isProduction,
      api: this.apiConfig,
      webhooks: this.webhookConfig
    };
    
    return key ? config[key] : config;
  }

  /**
   * Log configuration to console
   */
  logConfiguration() {
    console.group('🔧 Environment Configuration');
    console.log(`🌍 Hostname: ${window.location.hostname}`);
    console.log(`🔗 Protocol: ${window.location.protocol}`);
    console.log(`🏪 Environment: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📍 Localhost: ${this.isLocalhost ? 'YES' : 'NO'}`);
    console.log(`📡 API Base URL: ${this.apiConfig.baseURL}`);
    console.log(`⏱️  API Timeout: ${this.apiConfig.timeout}ms`);
    console.log(`🔄 Retry Attempts: ${this.apiConfig.retryAttempts}`);
    console.log(`🔗 N8N Webhook: ${this.webhookConfig.n8n.url}`);
    if (this.webhookConfig.local.url) {
      console.log(`🔗 Local Webhook: ${this.webhookConfig.local.url}`);
    }
    console.groupEnd();
  }

  /**
   * Validate API connectivity
   */
  async validateConnectivity() {
    console.log('🔍 Validating API connectivity...');
    
    try {
      const response = await fetch(this.getAPIUrl('/health'), {
        method: 'GET',
        timeout: this.apiConfig.timeout
      });
      
      if (response.ok) {
        console.log('✅ API is reachable');
        return true;
      } else {
        console.warn(`⚠️ API responded with status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.warn(`⚠️ API is not reachable: ${error.message}`);
      return false;
    }
  }

  /**
   * Set custom API URL (for override)
   */
  setCustomAPIUrl(url) {
    this.apiConfig.baseURL = url;
    localStorage.setItem('custom_api_url', url);
    console.log(`🔧 Custom API URL set: ${url}`);
    this.logConfiguration();
  }

  /**
   * Reset to default configuration
   */
  resetConfiguration() {
    localStorage.removeItem('custom_api_url');
    this.apiConfig = this.configureAPI();
    console.log('🔄 Configuration reset to defaults');
    this.logConfiguration();
  }

  /**
   * Override webhook URL (for testing)
   */
  setCustomWebhookUrl(type, url) {
    if (this.webhookConfig[type]) {
      this.webhookConfig[type].url = url;
      localStorage.setItem(`webhook_${type}_url`, url);
      console.log(`🔧 Custom ${type} webhook URL set: ${url}`);
    } else {
      console.error(`❌ Unknown webhook type: ${type}`);
    }
  }
}

// ========================================
// INITIALIZE GLOBAL CONFIGURATION
// ========================================

// Create global config instance
const CONFIG = new EnvironmentConfig();

// Export for use in other modules
window.CONFIG = CONFIG;
window.ENV = CONFIG.getConfig();

// Make API helper functions globally available
window.getAPIUrl = (endpoint) => CONFIG.getAPIUrl(endpoint);
window.getWebhookUrl = (type) => CONFIG.getWebhookUrl(type);
window.validateAPI = () => CONFIG.validateConnectivity();

console.log('✅ Environment configuration loaded');
