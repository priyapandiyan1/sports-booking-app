import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from './api';

// ─── Replace these values with YOUR Firebase project config ───────────────────
// Get them from: Firebase Console → Your Project → Project Settings → General → Your Apps
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'YOUR_PROJECT.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'YOUR_APP_ID',
};

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request notification permission, get the FCM token and register it with the backend.
 * @param {string} vapidKey - VAPID public key from Firebase Console → Cloud Messaging → Web Push
 */
export async function registerFCMToken(vapidKey) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    });

    if (token) {
      console.log('🔔 FCM token obtained:', token.slice(0, 20) + '...');
      // Save token to backend
      await api.post('/api/notifications/token', { token, device: 'browser' });
    }
    return token;
  } catch (err) {
    console.error('❌ FCM registration error:', err.message);
    return null;
  }
}

/**
 * Listen for foreground messages (app is open).
 * @param {function} callback - Called with { title, body, data }
 */
export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    console.log('📬 Foreground FCM message:', payload);
    callback({
      title: payload.notification?.title || 'New Booking',
      body:  payload.notification?.body  || '',
      data:  payload.data || {},
    });
  });
}
