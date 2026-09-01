// Sell Like Crazy — Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = 'slc-v1'
const STATIC_ASSETS = ['/', '/index.html', '/logo.png']

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — serve from cache when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  )
})

// Push notification received
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, icon, badge, url, actions } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/logo.png',
      badge: badge || '/logo.png',
      vibrate: [100, 50, 100],
      data: { url: url || '/' },
      actions: actions || [],
      requireInteraction: false,
    })
  )
})

// Notification clicked — open relevant page
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
