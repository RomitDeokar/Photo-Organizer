export class AlbumGrid {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.albums = [];
    console.log('AlbumGrid initialized with container:', this.container);
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.container) {
      console.error('Album grid container not found:', this.container);
      return;
    }

    this.container.addEventListener('click', (e) => {
      console.log('Album grid clicked, target:', e.target);
      const albumCard = e.target.closest('.album-card');
      if (albumCard) {
        console.log('Album card found:', albumCard);
        const albumId = albumCard.dataset.id;
        const album = this.albums.find(a => a.id === albumId);
        if (album) {
          console.log('Dispatching albumClick event for:', album);
          const event = new CustomEvent('albumClick', {
            detail: { album },
            bubbles: true
          });
          this.container.dispatchEvent(event);
        }
      }
    });
  }

  render(albums) {
    this.albums = albums;
    this.container.innerHTML = this.getGroupedAlbumsHTML();
  }

  getGroupedAlbumsHTML() {
    const grouped = this.groupAlbumsByDate();
    return Object.entries(grouped)
      .map(([date, albums]) => `
        <div class="album-group">
          <h2 class="album-group-title">${date}</h2>
          <div class="album-grid">
            ${albums.map(album => this.getAlbumCardHTML(album)).join('')}
          </div>
        </div>
      `)
      .join('');
  }

  getAlbumCardHTML(album) {
    const date = new Date(album.created_at);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);

    return `
      <article class="album-card" data-id="${album.id}" role="button" tabindex="0">
        <div class="album-cover">
          <div class="album-placeholder"></div>
        </div>
        <div class="album-info">
          <h3 class="album-title">${album.name}</h3>
          <p class="album-date">${formattedDate}</p>
          <p class="album-count">${album.photo_count || 0} photos</p>
        </div>
      </article>
    `;
  }

  groupAlbumsByDate() {
    return this.albums.reduce((groups, album) => {
      const date = new Date(album.created_at);
      const monthYear = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
      }).format(date);

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(album);
      return groups;
    }, {});
  }
}
