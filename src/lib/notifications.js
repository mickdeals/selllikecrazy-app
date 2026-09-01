/**
 * Push Notifications — Sell Like Crazy
 * Uses Web Push API + Supabase to deliver notifications
 * Works on Android (Chrome) and iOS 16.4+ (Safari)
 */

// VAPID public key — generate your own at:
// https://web-push-codelab.glitch.me/
// Then add VITE_VAPID_PUBLIC_KEY to .env
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

/**
 * Convert VAPID key to Uint8Array (required by Push API)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

/**
 * Request push notification permission and register service worker
 * Call this after user logs in
 */
export async function requestNotificationPermission(userId) {
  try {
    // Check browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported in this browser')
      return false
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return false
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Save subscription to Supabase
    const { supabase } = await import('./supabase')
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription: JSON.stringify(subscription),
      updated_at: new Date().toISOString(),
    })

    console.log('Push notifications enabled ✓')
    return true
  } catch (err) {
    console.error('Push setup error:', err)
    return false
  }
}

/**
 * Show a local notification (for testing / immediate feedback)
 */
export function showLocalNotification(title, body, data = {}) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data,
        actions: data.actions || [],
      })
    })
  }
}

/**
 * Notification types and their messages
 */
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: (senderName, listingTitle) => ({
    title: `💬 New message`,
    body: `${senderName} messaged you about "${listingTitle}"`,
  }),
  NEW_OFFER: (amount, listingTitle) => ({
    title: `🤝 New offer received`,
    body: `Someone offered $${amount} on "${listingTitle}"`,
  }),
  OFFER_ACCEPTED: (listingTitle) => ({
    title: `✅ Offer accepted!`,
    body: `Your offer on "${listingTitle}" was accepted — complete payment within 6 hours`,
  }),
  OFFER_DECLINED: (listingTitle) => ({
    title: `❌ Offer declined`,
    body: `Your offer on "${listingTitle}" was declined`,
  }),
  OFFER_COUNTERED: (amount, listingTitle) => ({
    title: `↩️ Counter offer`,
    body: `Seller countered with $${amount} on "${listingTitle}"`,
  }),
  LISTING_SAVED: (count, listingTitle) => ({
    title: `❤️ People are watching`,
    body: `${count} people saved "${listingTitle}"`,
  }),
  SAVED_SEARCH_MATCH: (query) => ({
    title: `🔔 New match for you`,
    body: `A listing matching "${query}" just appeared`,
  }),
  LISTING_SOLD: (listingTitle) => ({
    title: `🎉 Item sold!`,
    body: `"${listingTitle}" has been marked as sold`,
  }),
  REVIEW_RECEIVED: (rating, reviewer) => ({
    title: `⭐ New review`,
    body: `${reviewer} gave you ${rating} stars`,
  }),
}
