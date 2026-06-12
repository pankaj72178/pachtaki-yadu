// ========================================
// IMAGE UPLOAD CLIENT - FILE-BASED SYSTEM
// ========================================
// Optimized image upload using FormData instead of base64

class ImageUploadManager {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB default
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.uploadEndpoint = options.uploadEndpoint || '/api/upload';
    this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    console.log('✅ ImageUploadManager initialized');
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} - { valid: boolean, error: string }
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!(file instanceof File)) {
      return { valid: false, error: 'Invalid file object' };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Supported: ${this.allowedTypes.join(', ')}`
      };
    }

    // Check file extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      return { valid: false, error: `File extension not allowed: ${ext}` };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      const maxMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size exceeds maximum of ${maxMB}MB (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
      };
    }

    // Check for suspicious content (basic checks)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return { valid: false, error: 'Invalid filename detected' };
    }

    return { valid: true };
  }

  /**
   * Generate preview URL from file
   * @param {File} file - File to preview
   * @returns {Promise<string>} - Data URL for preview
   */
  generatePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload file to server
   * @param {File} file - File to upload
   * @param {string} loadingElementId - Element ID for loading state
   * @returns {Promise<Object>} - { fileUrl: string, filename: string, size: number }
   */
  async uploadFile(file, loadingElementId = null) {
    try {
      console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Show loading state
      if (loadingElementId) {
        HTTP.setLoadingState(loadingElementId, true);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', new Date().getTime());
      formData.append('originalName', file.name);

      // Upload using HTTP client
      try {
        const response = await fetch(this.uploadEndpoint, {
          method: 'POST',
          body: formData
          // Don't set Content-Type header - browser will set it with boundary
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(error.error || `Upload failed with status ${response.status}`);
        }

        const result = await response.json();

        console.log(`✅ File uploaded: ${result.fileUrl}`);

        // Hide loading state
        if (loadingElementId) {
          HTTP.setLoadingState(loadingElementId, false);
        }

        return {
          fileUrl: result.fileUrl,
          filename: result.filename,
          size: result.size,
          uploadedAt: result.uploadedAt
        };

      } catch (uploadError) {
        console.error('❌ Upload error:', uploadError.message);
        throw uploadError;
      }

    } catch (error) {
      console.error('❌ Image upload error:', error.message);
      if (loadingElementId) {
        HTTP.setLoadingState(loadingElementId, false);
      }
      throw error;
    }
  }

  /**
   * Setup file input listener
   * @param {string} inputId - File input ID
   * @param {string} previewId - Preview image ID
   * @param {string} previewContainerId - Preview container ID
   * @param {Function} onFileSelected - Callback when file selected
   */
  setupFileInput(inputId, previewId, previewContainerId, onFileSelected) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput) {
      console.warn(`⚠️ File input not found: #${inputId}`);
      return;
    }

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Generate preview
        const previewUrl = await this.generatePreview(file);
        
        // Show preview
        const previewImage = document.getElementById(previewId);
        const previewContainer = document.getElementById(previewContainerId);
        
        if (previewImage) previewImage.src = previewUrl;
        if (previewContainer) previewContainer.classList.remove('hidden');

        // Call callback
        if (typeof onFileSelected === 'function') {
          onFileSelected(file);
        }

        console.log(`✅ Preview generated for: ${file.name}`);
      } catch (error) {
        console.error('❌ Preview generation error:', error);
        showNotification('Error generating preview: ' + error.message, 'error');
      }
    });
  }

  /**
   * Get file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Delete uploaded file
   * @param {string} fileUrl - URL of file to delete
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileUrl) {
    try {
      console.log(`🗑️ Deleting file: ${fileUrl}`);

      const response = await fetch(`${this.uploadEndpoint}?fileUrl=${encodeURIComponent(fileUrl)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      console.log(`✅ File deleted: ${fileUrl}`);
      return true;

    } catch (error) {
      console.error('❌ Delete error:', error.message);
      return false;
    }
  }

  /**
   * Get upload endpoint
   * @returns {string}
   */
  getUploadEndpoint() {
    return this.uploadEndpoint;
  }

  /**
   * Set custom upload endpoint
   * @param {string} endpoint
   */
  setUploadEndpoint(endpoint) {
    this.uploadEndpoint = endpoint;
    console.log(`🔧 Upload endpoint set to: ${endpoint}`);
  }
}

// ========================================
// INITIALIZE GLOBAL IMAGE MANAGER
// ========================================

const ImageUpload = new ImageUploadManager({
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  uploadEndpoint: '/api/upload'
});

// Make globally available
window.ImageUpload = ImageUpload;

console.log('✅ ImageUploadManager loaded as window.ImageUpload');
