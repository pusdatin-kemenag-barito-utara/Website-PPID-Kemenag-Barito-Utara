// Enterprise Progressive Web App (PWA) Service Worker - PPID Kemenag Barito Utara
const CACHE_VERSION = 'ppid-kemenag-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_ASSETS = [
	'/',
	'/site.webmanifest',
	'/logo-kemenag.svg',
	'/hapakat.png',
	'/favicon.svg',
	'/favicon.ico',
];

// Install Event - Precache core app shell
self.addEventListener('install', (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => {
			return cache.addAll(PRECACHE_ASSETS).catch((err) => {
				console.warn('[SW] Precache asset fetch warning:', err);
			});
		})
	);
});

// Activate Event - Clean old caches & claim clients immediately
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (!cacheName.startsWith(CACHE_VERSION)) {
						return caches.delete(cacheName);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});

// Fetch Event - Intelligent Caching Strategies
self.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);

	// 1. Never intercept non-GET requests, Chrome extensions, or WebSockets
	if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
		return;
	}

	// 2. Real-time Pass-through for API calls & Admin Dashboard (No Stale Caching)
	if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
		return;
	}

	// 3. Stale-While-Revalidate for Fonts, Static Images, CSS, & JS bundles
	const isStaticAsset =
		url.origin === 'https://fonts.googleapis.com' ||
		url.origin === 'https://fonts.gstatic.com' ||
		url.pathname.startsWith('/_astro/') ||
		url.pathname.match(/\.(css|js|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/i);

	if (isStaticAsset) {
		event.respondWith(
			caches.open(STATIC_CACHE).then(async (cache) => {
				const cachedResponse = await cache.match(request);
				const fetchPromise = fetch(request)
					.then((networkResponse) => {
						if (networkResponse && networkResponse.status === 200) {
							cache.put(request, networkResponse.clone());
						}
						return networkResponse;
					})
					.catch(() => cachedResponse);

				return cachedResponse || fetchPromise;
			})
		);
		return;
	}

	// 4. Network-First with Cache Fallback for Navigation HTML pages
	if (request.mode === 'navigate' || request.destination === 'document') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response && response.status === 200) {
						const responseClone = response.clone();
						caches.open(PAGES_CACHE).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return response;
				})
				.catch(async () => {
					const cachedResponse = await caches.match(request);
					if (cachedResponse) return cachedResponse;
					const fallbackHome = await caches.match('/');
					if (fallbackHome) return fallbackHome;

					return new Response(
						`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/><title>Offline - PPID Kemenag Barito Utara</title><style>body{font-family:sans-serif;text-align:center;padding:4rem 1rem;color:#1e293b}h1{color:#007144}a{color:#007144;font-weight:bold}</style></head><body><h1>Anda Sedang Offline</h1><p>Koneksi internet Anda sedang terputus. Silakan periksa jaringan Anda.</p><a href="/">Muat Ulang</a></body></html>`,
						{
							headers: { 'Content-Type': 'text/html; charset=utf-8' },
						}
					);
				})
		);
	}
});
