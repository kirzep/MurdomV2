// public/sw.js

// Обновляем версию кеша. Это заставит браузер переустановить service worker и закешировать все заново.
const CACHE_NAME = 'cat-archive-cache-v5';
// Добавляем кеш для динамических данных (API) и изображений
const DATA_CACHE_NAME = 'cat-archive-data-cache-v1';

const URLS_TO_CACHE = [
  // Основные страницы, необходимые для "каркаса" приложения
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  // Важные ресурсы
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching basic assets');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Активация и очистка старых кешей
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME]; // Добавляем новый кеш в "белый список"
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  // ИСПРАВЛЕНИЕ: Теперь мы кешируем запросы к API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Если мы получили ответ от сети, кешируем его и возвращаем
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Если сети нет, ищем ответ в кеше
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Для всех остальных запросов (страницы, изображения) используем "Cache First"
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Если есть в кеше, отдаем из кеша
      if (cachedResponse) {
        return cachedResponse;
      }
      // Иначе идем в сеть и кешируем на будущее
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
