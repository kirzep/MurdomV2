// public/sw.js

// ИЗМЕНЕНИЕ: Снова увеличиваем версию, чтобы активировать новый Service Worker
const CACHE_VERSION = 'v13';
const CACHE_NAME = `cat-archive-shell-${CACHE_VERSION}`;

// Список ключевых файлов, которые будут закешированы при установке.
// Это "оболочка" вашего приложения.
const FILES_TO_CACHE = [
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  '/manifest.json?v=2.1.0', // Добавляем версию, чтобы манифест точно обновился
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.ico',
  '/icons/apple-touch-icon.png'
];

// Установка сервис-воркера
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Установка версии ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кеширование оболочки приложения...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старого кеша
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Активация версии ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем все кеши, которые не соответствуют текущей версии
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- НОВАЯ ЛОГИКА ПЕРЕХВАТА ЗАПРОСОВ ---
// Стратегия: "Сначала сеть, потом кеш" для всех GET-запросов.
self.addEventListener('fetch', (event) => {
  // Игнорируем все, кроме GET-запросов, и запросы расширений
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    // 1. Сначала пытаемся получить ресурс из сети
    fetch(event.request)
      .then((networkResponse) => {
        console.log(`[Service Worker] Получено из сети: ${event.request.url}`);
        
        // Если запрос успешен, клонируем ответ и сохраняем его в кеш
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // 2. Если сеть недоступна, пытаемся отдать ресурс из кеша
        console.log(`[Service Worker] Сеть недоступна, ищем в кеше: ${event.request.url}`);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log(`[Service Worker] Найдено в кеше: ${event.request.url}`);
            return cachedResponse;
          }

          // Если ресурса нет ни в сети, ни в кеше, можно вернуть заглушку
          console.warn(`[Service Worker] Ресурс не найден нигде: ${event.request.url}`);
          // Для HTML-страниц можно вернуть специальную оффлайн-страницу
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return new Response('<h1>Вы оффлайн</h1><p>Похоже, у вас нет подключения к интернету, а эта страница не была сохранена ранее.</p>', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
        });
      })
  );
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
