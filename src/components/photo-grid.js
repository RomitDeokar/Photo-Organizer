export class PhotoGrid {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.photos = [];
    this.setupEventListeners();
    this.setupModal();
  }

  setupModal() {
    // Create modal for viewing photos
    const modal = document.createElement('dialog');
    modal.className = 'modal photo-modal';
    modal.innerHTML = `
      <div class="photo-modal-content">
        <img src="" alt="" />
        <div class="photo-modal-info">
          <span class="photo-name"></span>
          <span class="photo-date"></span>
        </div>
        <div class="photo-modal-actions">
          <button class="btn btn-text" data-close-modal>Close</button>
          <button class="btn btn-danger" data-delete-photo>Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.modal = modal;

    // Add event listeners for modal
    modal.querySelector('[data-close-modal]').addEventListener('click', () => {
      modal.close();
    });

    modal.querySelector('[data-delete-photo]').addEventListener('click', () => {
      if (this.activePhotoId) {
        this.deletePhoto(this.activePhotoId);
        modal.close();
      }
    });
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      const photoCard = e.target.closest('.photo-card');
      if (!photoCard) return;

      const photoId = photoCard.dataset.id;
      const photo = this.photos.find(p => p.id === photoId);
      if (!photo) return;

      if (e.target.closest('.delete-button')) {
        this.deletePhoto(photoId);
      } else if (e.target.closest('.view-button') || e.target.closest('img')) {
        this.showPhotoModal(photo);
      }
    });
  }

  showPhotoModal(photo) {
    this.activePhotoId = photo.id;
    const img = this.modal.querySelector('img');
    img.src = photo.data;
    img.alt = photo.filename;
    this.modal.querySelector('.photo-name').textContent = photo.filename;
    this.modal.querySelector('.photo-date').textContent = this.formatDate(photo.taken_at);
    this.modal.showModal();
  }

  async deletePhoto(photoId) {
    const event = new CustomEvent('photoDelete', {
      detail: { photoId },
      bubbles: true
    });
    this.container.dispatchEvent(event);
    
    // Remove from local array and re-render
    this.photos = this.photos.filter(p => p.id !== photoId);
    this.render(this.photos);
  }

  render(photos) {
    this.photos = photos;
    this.container.innerHTML = `
      <div class="photo-grid">
        ${photos.map(photo => this.getPhotoCardHTML(photo)).join('')}
      </div>
    `;
  }

  getPhotoCardHTML(photo) {
    return `
      <div class="photo-card" data-id="${photo.id}">
        <div class="photo-wrapper">
          <img src="${photo.data}" alt="${photo.filename}" loading="lazy" />
          <div class="photo-actions">
            <button class="btn btn-icon view-button" title="View photo">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="btn btn-icon delete-button" title="Delete photo">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div class="photo-info">
          <span class="photo-name">${photo.filename}</span>
          <span class="photo-date">${this.formatDate(photo.taken_at)}</span>
        </div>
      </div>
    `;
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  addPhoto(photo) {
    this.photos.push(photo);
    this.render(this.photos);
  }
}
