(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=e(o);fetch(o.href,n)}})();class w{constructor(t){this.container=document.getElementById(t),this.albums=[],console.log("AlbumGrid initialized with container:",this.container),this.setupEventListeners()}setupEventListeners(){if(!this.container){console.error("Album grid container not found:",this.container);return}this.container.addEventListener("click",t=>{console.log("Album grid clicked, target:",t.target);const e=t.target.closest(".album-card");if(e){console.log("Album card found:",e);const s=e.dataset.id,o=this.albums.find(n=>n.id===s);if(o){console.log("Dispatching albumClick event for:",o);const n=new CustomEvent("albumClick",{detail:{album:o},bubbles:!0});this.container.dispatchEvent(n)}}})}render(t){this.albums=t,this.container.innerHTML=this.getGroupedAlbumsHTML()}getGroupedAlbumsHTML(){const t=this.groupAlbumsByDate();return Object.entries(t).map(([e,s])=>`
        <div class="album-group">
          <h2 class="album-group-title">${e}</h2>
          <div class="album-grid">
            ${s.map(o=>this.getAlbumCardHTML(o)).join("")}
          </div>
        </div>
      `).join("")}getAlbumCardHTML(t){const e=new Date(t.created_at),s=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long",day:"numeric"}).format(e);return`
      <article class="album-card" data-id="${t.id}" role="button" tabindex="0">
        <div class="album-cover">
          <div class="album-placeholder"></div>
        </div>
        <div class="album-info">
          <h3 class="album-title">${t.name}</h3>
          <p class="album-date">${s}</p>
          <p class="album-count">${t.photo_count||0} photos</p>
        </div>
      </article>
    `}groupAlbumsByDate(){return this.albums.reduce((t,e)=>{const s=new Date(e.created_at),o=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long"}).format(s);return t[o]||(t[o]=[]),t[o].push(e),t},{})}}class L{constructor(t,e){this.container=document.getElementById(t),this.albumId=e,this.setupUploader()}setupUploader(){this.container.innerHTML=`
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
    `,this.setupEventListeners()}setupEventListeners(){const t=document.getElementById("uploadZone"),e=document.getElementById("fileInput");t.addEventListener("dragover",s=>{s.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",s=>{s.preventDefault(),t.classList.remove("dragover");const o=s.dataTransfer.files;this.handleFiles(o)}),t.addEventListener("click",()=>{e.click()}),e.addEventListener("change",()=>{this.handleFiles(e.files)})}async handleFiles(t){const e=Array.from(t).filter(o=>o.type.startsWith("image/")),s=document.getElementById("uploadProgress");for(const o of e){const n=document.createElement("div");n.className="progress-item",n.innerHTML=`
        <span class="filename">${o.name}</span>
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
      `,s.appendChild(n),await this.processAndStorePhoto(o,n)}}async processAndStorePhoto(t,e){const s=new FileReader;s.onprogress=o=>{if(o.lengthComputable){const n=o.loaded/o.total*100;e.querySelector(".progress").style.width=`${n}%`}};try{const o=await new Promise((l,m)=>{s.onload=()=>l(s.result),s.onerror=()=>m(s.error),s.readAsDataURL(t)}),n=new Image,a=await new Promise(l=>{n.onload=()=>l({width:n.width,height:n.height}),n.src=o}),r={id:crypto.randomUUID(),album_id:this.albumId,filename:t.name,original_filename:t.name,mime_type:t.type,size:t.size,width:a.width,height:a.height,taken_at:t.lastModified,uploaded_at:Date.now(),metadata:JSON.stringify({lastModified:t.lastModified,type:t.type}),data:o},c=new CustomEvent("photoUploaded",{detail:r});this.container.dispatchEvent(c),e.classList.add("complete"),setTimeout(()=>{e.remove()},2e3)}catch(o){console.error("Error processing photo:",o),e.classList.add("error"),e.innerHTML+=`<span class="error-message">${o.message}</span>`}}}class P{constructor(t){this.container=document.getElementById(t),this.photos=[],this.setupEventListeners(),this.setupModal()}setupModal(){const t=document.createElement("dialog");t.className="modal photo-modal",t.innerHTML=`
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
    `,document.body.appendChild(t),this.modal=t,t.querySelector("[data-close-modal]").addEventListener("click",()=>{t.close()}),t.querySelector("[data-delete-photo]").addEventListener("click",()=>{this.activePhotoId&&(this.deletePhoto(this.activePhotoId),t.close())})}setupEventListeners(){this.container.addEventListener("click",t=>{const e=t.target.closest(".photo-card");if(!e)return;const s=e.dataset.id,o=this.photos.find(n=>n.id===s);o&&(t.target.closest(".delete-button")?this.deletePhoto(s):(t.target.closest(".view-button")||t.target.closest("img"))&&this.showPhotoModal(o))})}showPhotoModal(t){this.activePhotoId=t.id;const e=this.modal.querySelector("img");e.src=t.data,e.alt=t.filename,this.modal.querySelector(".photo-name").textContent=t.filename,this.modal.querySelector(".photo-date").textContent=this.formatDate(t.taken_at),this.modal.showModal()}async deletePhoto(t){const e=new CustomEvent("photoDelete",{detail:{photoId:t},bubbles:!0});this.container.dispatchEvent(e),this.photos=this.photos.filter(s=>s.id!==t),this.render(this.photos)}render(t){this.photos=t,this.container.innerHTML=`
      <div class="photo-grid">
        ${t.map(e=>this.getPhotoCardHTML(e)).join("")}
      </div>
    `}getPhotoCardHTML(t){return`
      <div class="photo-card" data-id="${t.id}">
        <div class="photo-wrapper">
          <img src="${t.data}" alt="${t.filename}" loading="lazy" />
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
          <span class="photo-name">${t.filename}</span>
          <span class="photo-date">${this.formatDate(t.taken_at)}</span>
        </div>
      </div>
    `}formatDate(t){return new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}addPhoto(t){this.photos.push(t),this.render(this.photos)}}class E{constructor(){this.dbName="photoAlbumDB",this.version=1,this.db=null}async init(){return new Promise((t,e)=>{const s=indexedDB.open(this.dbName,this.version);s.onerror=()=>e(s.error),s.onsuccess=()=>{this.db=s.result,t()},s.onupgradeneeded=o=>{const n=o.target.result,a=n.createObjectStore("albums",{keyPath:"id"});a.createIndex("created_at","created_at"),a.createIndex("sort_order","sort_order");const r=n.createObjectStore("photos",{keyPath:"id"});r.createIndex("album_id","album_id"),r.createIndex("taken_at","taken_at")}})}async createAlbum(t){return new Promise((e,s)=>{const a=this.db.transaction(["albums"],"readwrite").objectStore("albums").add(t);a.onsuccess=()=>e(t),a.onerror=()=>s(a.error)})}async getAlbums(){return new Promise((t,e)=>{const s=this.db.transaction(["albums","photos"],"readonly"),o=s.objectStore("albums");s.objectStore("photos");const n=o.index("sort_order").getAll();n.onsuccess=async()=>{const a=n.result,r=await Promise.all(a.map(async c=>{const l=await this.getPhotoCount(c.id),m=await this.getFirstPhoto(c.id);return{...c,photo_count:l,first_photo_id:m?.id}}));t(r)},n.onerror=()=>e(n.error)})}async getPhotoCount(t){return new Promise((e,s)=>{const r=this.db.transaction(["photos"],"readonly").objectStore("photos").index("album_id").count(t);r.onsuccess=()=>e(r.result),r.onerror=()=>s(r.error)})}async getFirstPhoto(t){return new Promise((e,s)=>{const r=this.db.transaction(["photos"],"readonly").objectStore("photos").index("album_id").get(t);r.onsuccess=()=>e(r.result),r.onerror=()=>s(r.error)})}async createPhoto(t){return new Promise((e,s)=>{const a=this.db.transaction(["photos"],"readwrite").objectStore("photos").add(t);a.onsuccess=()=>e(t),a.onerror=()=>s(a.error)})}async getPhotos(t){return new Promise((e,s)=>{const r=this.db.transaction(["photos"],"readonly").objectStore("photos").index("album_id").getAll(t);r.onsuccess=()=>e(r.result),r.onerror=()=>s(r.error)})}async deletePhoto(t){return new Promise((e,s)=>{const a=this.db.transaction(["photos"],"readwrite").objectStore("photos").delete(t);a.onsuccess=()=>e(),a.onerror=()=>s(a.error)})}}const d=new E,A=new w("albumGrid"),h=document.getElementById("createAlbumDialog"),g=document.getElementById("createAlbumForm"),y=document.getElementById("albumsView"),f=document.getElementById("albumView"),p=document.getElementById("backToAlbums"),I=document.getElementById("albumTitle"),k=document.getElementById("photoUploader");document.getElementById("photoGrid");let v=null,u=null;await d.init();async function b(){const i=await d.getAlbums();A.render(i)}document.getElementById("createAlbumBtn").addEventListener("click",()=>{h.showModal()});document.querySelector("[data-close-modal]").addEventListener("click",()=>{h.close()});g.addEventListener("submit",async i=>{i.preventDefault();const t=new FormData(i.target),e=Date.now(),s={id:crypto.randomUUID(),name:t.get("name"),description:t.get("description"),created_at:e,updated_at:e,sort_order:(await d.getAlbums()).length};await d.createAlbum(s),h.close(),g.reset(),await b()});document.addEventListener("albumClick",i=>{console.log("Album clicked:",i.detail.album),D(i.detail.album)});p?.addEventListener("click",()=>{console.log("Back to albums clicked"),C()});function D(i){I.textContent=i.name,y.style.display="none",f.style.display="block",p.style.display="block",v||(v=new L("photoUploader",i.id),k.addEventListener("photoUploaded",async t=>{await d.createPhoto(t.detail),u.addPhoto(t.detail)})),u||(u=new P("photoGrid")),M(i.id)}function C(){y.style.display="block",f.style.display="none",p.style.display="none",b()}async function M(i){const t=await d.getPhotos(i);u.render(t)}await b();
