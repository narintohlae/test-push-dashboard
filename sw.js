const CACHE_NAME = 'my-company-v1';
const urlsToCache = [
  './',
  './manifest.json',
];

// ติดตั้ง Service Worker สำหรับ PWA
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

// จัดการ Cache สำหรับหน้าเว็บปกติ
self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// ล้าง Cache เก่า
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
      })
    ))
  );
});

// ==========================================
// ส่วนของการแจ้งเตือน (Firebase Cloud Messaging)
// ==========================================
// นำเข้า Firebase แบบ Compat สำหรับรันบน Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// ตั้งค่าโปรเจกต์ของคุณ (my-company-time-tracking)
firebase.initializeApp({
  apiKey: "AIzaSyBHuZGyY1F3v4rCrhrpt9YB90C0Ahh-stE",
  authDomain: "my-company-time-tracking.firebaseapp.com",
  projectId: "my-company-time-tracking",
  storageBucket: "my-company-time-tracking.firebasestorage.app",
  messagingSenderId: "758524847747",
  appId: "1:758524847747:web:2e5a49e4064334f1265db6"
});

const messaging = firebase.messaging();

// รับแจ้งเตือนตอนที่ปิดแอปไปแล้ว
messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'แจ้งเตือนระบบผู้จัดการ';
  const notificationOptions = {
    body: payload.notification.body || 'มีข้อความใหม่',
    icon: 'icon-192x192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
