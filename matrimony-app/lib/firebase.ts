import { Platform } from 'react-native';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBLZ_BdZ1kJXqy6Qyj7HZYZ6ZzhV-q5z04',
  authDomain: 'matrimony-mobile-app-8541d.firebaseapp.com',
  projectId: 'matrimony-mobile-app-8541d',
  storageBucket: 'matrimony-mobile-app-8541d.firebasestorage.app',
  messagingSenderId: '639617536980',
  appId: '1:639617536980:web:e0c444696d613a9783bc41',
  measurementId: 'G-MN88BWXEQ2',
};

function canUseFirebase(): boolean {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analyticsInstance: Analytics | null = null;
let initPromise: Promise<void> | null = null;

async function ensureFirebase(): Promise<void> {
  if (!canUseFirebase()) {
    return;
  }

  if (app) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');

      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
    })();
  }

  await initPromise;
}

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  await ensureFirebase();
  return app;
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  await ensureFirebase();
  return auth;
}

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (!canUseFirebase() || analyticsInstance) {
    return analyticsInstance;
  }

  await ensureFirebase();
  if (!app) {
    return null;
  }

  const { getAnalytics, isSupported } = await import('firebase/analytics');
  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}

export function getFirebaseAnalytics(): Analytics | null {
  return analyticsInstance;
}
