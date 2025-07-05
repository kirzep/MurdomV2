// public/sw.js

// ИЗМЕНЕНИЕ: Увеличиваем версию до v16, чтобы запустить обновление
const CACHE_VERSION = 'v16';
const CACHE_NAME = `cat-archive-shell-${CACHE_VERSION}`;

const FILES_TO_CACHE = [
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  // ИЗМЕНЕНИЕ: Убираем параметр '?v=2.1.0' отсюда.
  // Браузер все равно запросит новую версию манифеста благодаря ссылке в HTML.
  '/manifest.json', 
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.ico',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Установка версии ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кеширование оболочки приложения...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Установка завершена.');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] Ошибка при установке (addAll):', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Активация версии ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[Service Worker] Активация завершена.');
        return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        console.log('[SW] Навигация не удалась, возвращаем / из кеша.');
        return caches.match('/');
      })
    );
    return;
  }

  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  return event.respondWith(fetch(request));
});


// Обработчики Push-уведомлений (без изменений)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Архив Кошек', body: 'У вас новое уведомление.' };
    event.waitUntil(self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data.data || {}
    }));
});
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
    );
});
