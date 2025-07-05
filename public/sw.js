// public/sw.js

// ВАЖНО: При каждом новом развертывании приложения меняйте эту версию!
// Например, 'v11', 'v12' и т.д. Это гарантирует, что старый кеш удалится.
const CACHE_VERSION = 'v15';
const CACHE_NAME = `cat-archive-shell-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `cat-archive-data-${CACHE_VERSION}`;

// Файлы, которые составляют "оболочку" приложения.
const FILES_TO_CACHE = [
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 1. Установка сервис-воркера
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кеширование оболочки приложения...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Активация сервис-воркера и очистка старого кеша
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // --- ИСПРАВЛЕННАЯ ЛОГИКА ДЛЯ API ---
  if (request.url.includes('/api/')) {
    // Если это НЕ GET-запрос (например, POST, DELETE, PATCH),
    // просто отправляем его в сеть и не пытаемся кешировать.
    if (request.method !== 'GET') {
      return event.respondWith(fetch(request));
    }

    // Для GET-запросов используем стратегию "Сначала сеть, потом кеш"
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся отдать данные из кеша
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Стратегия для всех остальных запросов (страницы, CSS, JS, картинки): "Сначала кеш, потом сеть"
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});

// Обработчики Push-уведомлений
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Архив Кошек', body: 'У вас новое уведомление.' };
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data.data || {}
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
});
