class Database {
  constructor() {
    this.dbName = 'photoAlbumDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create albums store
        const albumsStore = db.createObjectStore('albums', { keyPath: 'id' });
        albumsStore.createIndex('created_at', 'created_at');
        albumsStore.createIndex('sort_order', 'sort_order');

        // Create photos store
        const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
        photosStore.createIndex('album_id', 'album_id');
        photosStore.createIndex('taken_at', 'taken_at');
      };
    });
  }

  async createAlbum(album) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['albums'], 'readwrite');
      const store = transaction.objectStore('albums');
      const request = store.add(album);

      request.onsuccess = () => resolve(album);
      request.onerror = () => reject(request.error);
    });
  }

  async getAlbums() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['albums', 'photos'], 'readonly');
      const albumStore = transaction.objectStore('albums');
      const photoStore = transaction.objectStore('photos');
      const request = albumStore.index('sort_order').getAll();

      request.onsuccess = async () => {
        const albums = request.result;
        const albumsWithCounts = await Promise.all(
          albums.map(async (album) => {
            const photoCount = await this.getPhotoCount(album.id);
            const firstPhoto = await this.getFirstPhoto(album.id);
            return {
              ...album,
              photo_count: photoCount,
              first_photo_id: firstPhoto?.id
            };
          })
        );
        resolve(albumsWithCounts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotoCount(albumId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('album_id');
      const request = index.count(albumId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFirstPhoto(albumId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('album_id');
      const request = index.get(albumId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createPhoto(photo) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      const request = store.add(photo);

      request.onsuccess = () => resolve(photo);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotos(albumId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('album_id');
      const request = index.getAll(albumId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      const request = store.delete(photoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new Database();
