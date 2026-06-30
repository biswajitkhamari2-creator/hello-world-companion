import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const isBrowser = typeof window !== "undefined";

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)?.trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined)?.trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)?.trim(),
};

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _initError: Error | null = null;

if (isBrowser && hasRequiredConfig) {
  try {
    _app = getApps()[0] ?? initializeApp(firebaseConfig as Record<string, string>);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  } catch (error) {
    _initError = error instanceof Error ? error : new Error(String(error));
    console.error(
      "[firebase] Firebase Auth could not start. Check that VITE_FIREBASE_API_KEY and the other VITE_FIREBASE_* values are copied from Firebase Console.",
      _initError,
    );
  }
} else if (isBrowser) {
  console.warn(
    "[firebase] Missing VITE_FIREBASE_* env vars. Auth is disabled until you add them to .env and restart the dev server.",
  );
}

export const firebaseConfigured = Boolean(_auth && _db);
export const firebaseApp = _app;
export const firebaseAuth = _auth;
export const firebaseDb = _db;
export const firebaseInitError = _initError;