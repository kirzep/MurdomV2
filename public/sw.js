// public/sw.js
const CACHE_NAME = 'murdom-cache-v1';

// 1. Файлы, которые кешируем сразу (чтобы приложение открывалось мгновенно)
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/favicon.ico'
];

// УСТАНОВКА
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// АКТИВАЦИЯ (Чистка старого кеша)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

// ПЕРЕХВАТ ЗАПРОСОВ (Самое важное!)
self.addEventListener('fetch', (event) => {
  // Игнорируем расширения браузера и не-GET запросы
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;

  const isApi = event.request.url.includes('/api/');
  const isNextStatic = event.request.url.includes('/_next/static/');

  if (isApi) {
    // СТРАТЕГИЯ 1: Network First (Для данных о котах)
    // Сначала идем в интернет за свежими данными. Если интернета нет — показываем кеш.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // СТРАТЕГИЯ 2: Stale-While-Revalidate (Для картинок, стилей и скриптов)
    // Показываем кеш мгновенно, а в фоне обновляем его на будущее.
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// --- ТВОЙ КОД УВЕДОМЛЕНИЙ (ОСТАВЛЯЕМ) ---

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Мурдом', body: 'Новое событие' };
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon-192x192.png', // Убедись, что этот файл есть
            badge: '/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/dashboard'
            }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Если вкладка открыта - фокусируемся, если нет - открываем
            for (const client of clientList) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/dashboard');
            }
        })
    );
});