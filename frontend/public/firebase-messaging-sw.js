// firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
// This service worker handles BACKGROUND push notifications (when the app tab
// is closed or not in focus). It must live in the /public folder so it is
// served from the root of the site.
//
// ⚠️  IMPORTANT: Replace the firebaseConfig values below with YOUR project's
//     config BEFORE deploying. Get them from:
//     Firebase Console → Project Settings → General → Your Apps → Firebase SDK snippet
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Replace with your Firebase project config ─────────────────────────────────
firebase.initializeApp({
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
});
// ─────────────────────────────────────────────────────────────────────────────

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title = 'Sports Hub', body = 'New booking alert!' } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title, {
    body,
    icon:               '/favicon.svg',
    badge:              '/favicon.svg',
    tag:                'sports-booking-alert',
    requireInteraction: true,
    vibrate:            [200, 100, 200],
    data:               { url: '/admin', ...data },
    actions: [
      { action: 'view',    title: '📋 View Dashboard' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  });
});

// Click on notification → open /admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If admin tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
