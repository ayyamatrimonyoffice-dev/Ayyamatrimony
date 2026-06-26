import { Platform } from 'react-native';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

const sharedFirebaseConfig = {
  authDomain: 'ayyamatrimonial.firebaseapp.com',
  projectId: 'ayyamatrimonial',
  storageBucket: 'ayyamatrimonial.firebasestorage.app',
  messagingSenderId: '735219494861',
};

const firebaseConfig = Platform.select({
  android: {
    ...sharedFirebaseConfig,
    apiKey: 'AIzaSyAn5XAYmRhYhhH5_HdtCCjdQN29kk0C35s',
    appId: '1:735219494861:android:10c72b5e64cabafee81e84',
  },
  default: {
    ...sharedFirebaseConfig,
    apiKey: 'AIzaSyBSxKe_LhI2Ped2SnQZgAxPkHuT10SqD2U',
    appId: '1:735219494861:web:4e8fc32a7d3c86ece81e84',
    measurementId: 'G-CKLYG6TNQ4',
  },
})!;

function canUseFirebase(): boolean {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
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
      const {
        getFirestore,
        initializeFirestore,
        memoryLocalCache,
        persistentLocalCache,
        setLogLevel,
      } = await import('firebase/firestore');
      const { getStorage } = await import('firebase/storage');

      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);

      setLogLevel(__DEV__ ? 'warn' : 'error');

      try {
        firestore =
          Platform.OS === 'web'
            ? initializeFirestore(app, { localCache: persistentLocalCache() })
            : initializeFirestore(app, { localCache: memoryLocalCache() });
      } catch {
        firestore = getFirestore(app);
      }

      storage = getStorage(app);
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

export async function getFirebaseFirestore(): Promise<Firestore | null> {
  await ensureFirebase();
  return firestore;
}

export async function getFirebaseStorage(): Promise<FirebaseStorage | null> {
  await ensureFirebase();
  return storage;
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
