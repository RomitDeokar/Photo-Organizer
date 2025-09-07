import { AlbumGrid } from './components/album-grid.js';
import { PhotoUploader } from './components/photo-uploader.js';
import { PhotoGrid } from './components/photo-grid.js';
import { db } from './db/database.js';

// Initialize components
const albumGrid = new AlbumGrid('albumGrid');
const createAlbumDialog = document.getElementById('createAlbumDialog');
const createAlbumForm = document.getElementById('createAlbumForm');
const albumsView = document.getElementById('albumsView');
const albumView = document.getElementById('albumView');
const backToAlbumsBtn = document.getElementById('backToAlbums');
const albumTitle = document.getElementById('albumTitle');
const photoUploaderContainer = document.getElementById('photoUploader');
const photoGridContainer = document.getElementById('photoGrid');

let currentAlbum = null;
let photoUploader = null;
let photoGrid = null;

// Initialize database
await db.init();

// Load and display albums
async function loadAlbums() {
  const albums = await db.getAlbums();
  albumGrid.render(albums);
}

// Create album form handling
document.getElementById('createAlbumBtn').addEventListener('click', () => {
  createAlbumDialog.showModal();
});

document.querySelector('[data-close-modal]').addEventListener('click', () => {
  createAlbumDialog.close();
});

createAlbumForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const now = Date.now();
  const album = {
    id: crypto.randomUUID(),
    name: formData.get('name'),
    description: formData.get('description'),
    created_at: now,
    updated_at: now,
    sort_order: (await db.getAlbums()).length
  };
  
  await db.createAlbum(album);
  createAlbumDialog.close();
  createAlbumForm.reset();
  await loadAlbums();
});

// Album view handling
document.addEventListener('albumClick', (e) => {
  console.log('Album clicked:', e.detail.album);
  showAlbumView(e.detail.album);
});

backToAlbumsBtn?.addEventListener('click', () => {
  console.log('Back to albums clicked');
  showAlbumsView();
});

function showAlbumView(album) {
  currentAlbum = album;
  albumTitle.textContent = album.name;
  albumsView.style.display = 'none';
  albumView.style.display = 'block';
  backToAlbumsBtn.style.display = 'block';

  // Initialize PhotoUploader and PhotoGrid if not already initialized
  if (!photoUploader) {
    photoUploader = new PhotoUploader('photoUploader', album.id);
    photoUploaderContainer.addEventListener('photoUploaded', async (e) => {
      await db.createPhoto(e.detail);
      photoGrid.addPhoto(e.detail);
    });
  }

  if (!photoGrid) {
    photoGrid = new PhotoGrid('photoGrid');
  }

  // Load photos for this album
  loadAlbumPhotos(album.id);
}

function showAlbumsView() {
  currentAlbum = null;
  albumsView.style.display = 'block';
  albumView.style.display = 'none';
  backToAlbumsBtn.style.display = 'none';
  loadAlbums();
}

async function loadAlbumPhotos(albumId) {
  const photos = await db.getPhotos(albumId);
  photoGrid.render(photos);
}

// Initial load
await loadAlbums();
