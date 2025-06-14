const CACHE_NAME = 'cat-archive-shell-v2'; // Версия кеша увеличена для обновления
const DATA_CACHE_NAME = 'cat-archive-data-v2'; // Версия кеша данных также увеличена

const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/profile',
  '/staff',
  '/login',
  '/manifest.json',
  '/favicon.png', // Добавлена иконка
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened shell cache and caching basic assets');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
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
  // Принудительно активируем новый SW немедленно
  return self.clients.claim();
});


self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request).then((networkResponse) => {
          if(networkResponse.status === 200) {
            cache.put(request.url, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Проверяем, что ответ корректный перед кешированием
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// --- НОВЫЕ ОБРАБОТЧИКИ ДЛЯ PUSH-УВЕДОМЛЕНИЙ ---

// Обработчик события push-уведомления
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Архив Кошек', body: 'У вас новое уведомление.' };
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png', // Иконка для статус-бара Android
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Обработчик клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      if (clientList.length > 0) {
        // Если вкладка уже открыта, фокусируемся на ней
        return clientList[0].focus();
      }
      // Иначе открываем новую вкладку
      return clients.openWindow(urlToOpen);
    })
  );
});