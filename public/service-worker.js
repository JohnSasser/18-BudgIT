const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/styles.css',
	'/index.js',
	// icons from manifest.json
	// tell phone how to launch locally;
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', function (evt) {
	evt.waitUntil(
		// caches.open will open the static-cache-v2 when the service worker starts;
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Your files were pre-cached successfully!');
			return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
});

// activate
self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log('Removing old cache data', key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

// fetch
self.addEventListener('fetch', function (evt) {
	// return the api
	if (evt.request.url.includes('/api/')) {
		// if network is available
		// pull data from server
		// if offline
		// pull data from IndexedDB

		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(evt.request)
						.then((response) => {
							// If the response was good, clone it and store it in the cache.
							if (response.status === 200) {
								cache.put(evt.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							// Network request failed, try to get it from the cache.
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}
	// return and continue to run the app from the cache instead of requesting server space;
	evt.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(evt.request).then((response) => {
				return response || fetch(evt.request);
			});
		})
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.url.startsWith(self.location.origin)) {
		console.log(self.location.origin);
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return caches.open(RUNTIME).then((cache) => {
					return fetch(event.request).then((response) => {
						return cache.put(event.request, response.clone()).then(() => {
							return response;
						});
					});
				});
			})
		);
	}
});
