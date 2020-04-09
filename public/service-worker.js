const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/favicon.ico',
	'/manifest.webmanifest',
	'/assets/css/style.css',
	'/assets/js/bundle.js',
	// icons from manifest.json
	'/assets/icons/icon_96x96.74b892b005aaab865730ec47e43273dd.png',
	'/assets/icons/icon_128x128.3d3683ece3cbf7afd56b9d4ebd823212.png',
	'/assets/icons/icon_192x192.317079d2f38bc5d2906f5408114bbcd3.png',
	'/assets/icons/icon_256x256.1ca8f124ffadfb876c6933bc575d46dd.png',
	'/assets/icons/icon_384x384.0b2a00b0b845312bc013ad85074b0753.png',
	'/assets/icons/icon_512x512.273935f8ebdc8218f2ce26daa11d6844.png',
	'/icons/icon-192x192.png',
	'/icons/icon-192x192.png',

	// '/assets/images/1.jpg',
	// '/assets/images/2.jpg',
	// '/assets/images/3.jpg',
	// '/assets/images/4.jpg',
	// '/assets/images/5.jpg',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', function (evt) {
	evt.waitUntil(
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
	if (evt.request.url.includes('/api/')) {
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

	evt.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(evt.request).then((response) => {
				return response || fetch(evt.request);
			});
		})
	);
});
