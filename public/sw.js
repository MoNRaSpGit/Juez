const CACHE_NAME = "juez-pwa-v2";

function getBasePath() {
  const scopeUrl = new URL(self.registration.scope);
  return scopeUrl.pathname.endsWith("/") ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
}

function getAppShell() {
  const basePath = getBasePath();
  return [
    basePath,
    `${basePath}index.html`,
    `${basePath}manifest.webmanifest`,
    `${basePath}icons/juez-icon.svg`,
    `${basePath}icons/juez-icon-maskable.svg`
  ];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(getAppShell());
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const basePath = getBasePath();
  const requestUrl = new URL(event.request.url);

  // Toda navegacion (abrir/recargar la app, no solo /index.html literal)
  // va siempre a la red -- si no, esta entrada queda fija desde el
  // install() y nunca se actualiza con los deploys nuevos, sirviendo un
  // HTML viejo con referencias a JS/CSS que ya no existen (pantalla
  // blanca hasta que por casualidad el navegador decida no usar el SW).
  if (
    event.request.mode === "navigate" ||
    requestUrl.pathname.endsWith("/app-build.json") ||
    requestUrl.pathname.endsWith("/index.html")
  ) {
    event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match(`${basePath}index.html`)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(`${basePath}index.html`);
          }

          return caches.match(basePath);
        });
    })
  );
});
