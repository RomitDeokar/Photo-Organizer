// Photo uploader component
export class PhotoUploader {
  constructor(containerId, albumId) {
    this.container = document.getElementById(containerId);
    this.albumId = albumId;
    this.setupUploader();
  }

  setupUploader() {
    this.container.innerHTML = `
      <div class="photo-uploader">
        <div class="upload-zone" id="uploadZone">
          <input type="file" id="fileInput" multiple accept="image/*" class="file-input" />
          <div class="upload-message">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="upload-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>Drop photos here or click to upload</p>
          </div>
        </div>
        <div id="uploadProgress" class="upload-progress"></div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      this.handleFiles(fileInput.files);
    });
  }

  async handleFiles(files) {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const progressContainer = document.getElementById('uploadProgress');

    for (const file of validFiles) {
      const progressElement = document.createElement('div');
      progressElement.className = 'progress-item';
      progressElement.innerHTML = `
        <span class="filename">${file.name}</span>
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
      `;
      progressContainer.appendChild(progressElement);

      await this.processAndStorePhoto(file, progressElement);
    }
  }

  async processAndStorePhoto(file, progressElement) {
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        progressElement.querySelector('.progress').style.width = `${progress}%`;
      }
    };

    try {
      // Read the file
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Create image element to get dimensions
      const img = new Image();
      const dimensions = await new Promise((resolve) => {
        img.onload = () => resolve({
          width: img.width,
          height: img.height
        });
        img.src = dataUrl;
      });

      // Create photo object
      const photo = {
        id: crypto.randomUUID(),
        album_id: this.albumId,
        filename: file.name,
        original_filename: file.name,
        mime_type: file.type,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        taken_at: file.lastModified,
        uploaded_at: Date.now(),
        metadata: JSON.stringify({
          lastModified: file.lastModified,
          type: file.type
        }),
        data: dataUrl // Store the image data directly
      };

      // Dispatch custom event with photo data
      const event = new CustomEvent('photoUploaded', { detail: photo });
      this.container.dispatchEvent(event);

      progressElement.classList.add('complete');
      setTimeout(() => {
        progressElement.remove();
      }, 2000);

    } catch (error) {
      console.error('Error processing photo:', error);
      progressElement.classList.add('error');
      progressElement.innerHTML += `<span class="error-message">${error.message}</span>`;
    }
  }
}
