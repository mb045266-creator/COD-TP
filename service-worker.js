/**
 * Service Worker - للعمل بدون اتصال إنترنت
 * يدير التخزين المؤقت والمزامنة في الخلفية
 */

const CACHE_NAME = 'cod-tp-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/mobile.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/css/mobile.css',
    '/js/utils.js',
    '/js/database.js',
    '/js/app.js',
    '/js/orders.js',
    '/js/agents.js',
    '/js/statistics.js',
    '/js/integrations.js',
    '/js/mobile.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch((err) => {
                console.log('بعض الملفات لم تتمكن من التخزين المؤقت');
            });
        })
    );
    self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // في حالة الفشل، يمكن إرجاع صفحة بديلة
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// معالجة الرسائل من العميل
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// المزامنة الدورية
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(
            // يمكن إضافة منطق المزامنة هنا
            Promise.resolve()
        );
    }
});
