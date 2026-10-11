import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Credentials are loaded from .env (VITE_ prefix is required by Vite)
// Copy .env.example → .env and paste your Firebase project values there.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (import.meta.env.DEV && !hasFirebaseConfig) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v || String(v).startsWith('YOUR_'))
    .map(([k]) => k);
  console.warn(
    `[Firebase] Missing env vars: ${missing.join(', ')}.\n` +
    'Copy .env.example → .env and fill in your Firebase project credentials.\n' +
    'Running in local-only mode so the app can still load.'
  );
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let app = null;
let auth = null;
let db = null;
let analytics = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Already initialized (HMR) or persistence unavailable — use the existing instance.
      db = getFirestore(app);
    }

    if (firebaseConfig.measurementId) {
      isSupported()
        .then((yes) => {
          if (yes) analytics = getAnalytics(app);
        })
        .catch(() => {});
    }
  } catch (e) {
    console.error('[Firebase] Init failed, running local-only:', e);
    app = null;
    auth = null;
    db = null;
    analytics = null;
  }
}

export { auth, db, analytics };
export const isFirebaseConfigured = Boolean(auth && db);
