const CACHE_NAME = 'murdle-app-v1'
const APP_SCOPE = new URL('./', self.registration.scope)
const APP_URL = APP_SCOPE.href

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch(APP_URL, { cache: 'reload' })
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać aplikacji do trybu offline: ${response.status}`)
    }

    const html = await response.clone().text()
    const urls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map((match) => new URL(match[1], APP_URL))
      .filter((url) => url.origin === self.location.origin && url.pathname.startsWith(APP_SCOPE.pathname))
      .map((url) => url.href)
    const cache = await caches.open(CACHE_NAME)
    await cache.put(APP_URL, response)
    await cache.addAll([...new Set(urls)])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('murdle-app-') && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const requestUrl = new URL(request.url)
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(APP_URL, response.clone())
        }
        return response
      } catch {
        const cachedApp = await caches.match(APP_URL)
        if (cachedApp) return cachedApp
        return Response.error()
      }
    })())
    return
  }

  if (!requestUrl.pathname.startsWith(APP_SCOPE.pathname)) return
  event.respondWith((async () => {
    const cachedResponse = await caches.match(request, { ignoreVary: true })
    if (cachedResponse) return cachedResponse

    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  })())
})
