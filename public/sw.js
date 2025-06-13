// public/sw.js

// ВАЖНО: Мы обновляем версию кеша. Это заставит браузер переустановить service worker.
const CACHE_NAME = 'cat-archive-shell-v1';
const DATA_CACHE_NAME = 'cat-archive-data-v1';

// Кешируем только основной "каркас" приложения
const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened shell cache and caching basic assets');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Активация и очистка старых кешей
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Для API-запросов используем стратегию "Stale-While-Revalidate"
  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request).then((networkResponse) => {
          // Если запрос успешен, обновляем кеш
          cache.put(request.url, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // Если сети нет, отдаем последнее, что есть в кеше
          return cache.match(request);
        });
      })
    );
    return;
  }

  // Для всех остальных запросов (страницы, изображения) используем "Cache First"
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Если есть в кеше, отдаем из кеша
      if (cachedResponse) {
        return cachedResponse;
      }
      // Иначе идем в сеть и кешируем на будущее
      return fetch(request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
