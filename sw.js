const CACHE_NAME = 'my-company-v1';
const urlsToCache = [
  './',
  './manifest.json',
  // หากคุณเซฟไฟล์ HTML ไว้ชื่ออะไร ให้เพิ่มเข้าไปในบรรทัดด้านล่างนี้ด้วยครับ
  // เช่น './employee.html', './manager.html'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// จัดการ Cache ตอนขอข้อมูล (Network-First Strategy เหมาะกับแอปที่ต่อ Database แบบ Real-time)
self.addEventListener('fetch', event => {
  // ยกเว้นการทำ Cache สำหรับการขอข้อมูลจาก Firebase Firestore/Auth
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// ล้าง Cache เก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});