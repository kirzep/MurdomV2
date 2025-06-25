// public/sw.js

// ВАЖНО: При каждом новом развертывании приложения меняйте эту версию!
// Например, 'v6', 'v7' и т.д. Это гарантирует, что старый кеш удалится.
const CACHE_VERSION = 'v10';
const CACHE_NAME = `cat-archive-shell-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `cat-archive-data-${CACHE_VERSION}`;

// Файлы, которые составляют "оболочку" приложения.
// Они кешируются при установке сервис-воркера.
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
  // Можно добавить сюда оффлайн-страницу, если она у вас будет
  // '/offline.html'
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
      .then(() => {
        // Заставляет новый сервис-воркер активироваться немедленно,
        // не дожидаясь закрытия всех вкладок.
        self.skipWaiting();
      })
  );
});

// 2. Активация сервис-воркера и очистка старого кеша
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем все кеши, которые не соответствуют текущей версии
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Позволяет новому сервис-воркеру немедленно взять под контроль все открытые страницы.
  self.clients.claim();
});

// 3. Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Игнорируем запросы от расширений Chrome
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Стратегия для API-запросов: "Сначала сеть, потом кеш" (Network First)
  // Это гарантирует, что данные всегда будут максимально свежими.
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Если запрос успешен, клонируем ответ и сохраняем в кеш данных
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
          return caches.match(request);
        })
    );
    return;
  }

  // Стратегия для навигации (HTML-страниц): "Сначала сеть, потом кеш"
  // Это решает вашу главную проблему: пользователь всегда получит новую версию сайта, если есть интернет.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Если сеть недоступна, отдаем корневую страницу из кеша.
          // В идеале здесь можно отдавать специальную оффлайн-страницу.
          return caches.match('/');
        })
    );
    return;
  }

  // Стратегия для всех остальных запросов (CSS, JS, картинки): "Сначала кеш, потом сеть" (Cache First)
  // Это самая быстрая стратегия для статических ресурсов.
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Если ресурс есть в кеше, отдаем его
        if (cachedResponse) {
          return cachedResponse;
        }
        // Если нет, идем в сеть, получаем ресурс и кешируем его на лету
        return fetch(request).then((networkResponse) => {
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

// Обработчики Push-уведомлений (остаются без изменений)
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