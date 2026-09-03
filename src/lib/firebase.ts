import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForNutriFamiliaApp2026",
  authDomain: "nutrifamilia-605c5.firebaseapp.com",
  projectId: "nutrifamilia-605c5",
  storageBucket: "nutrifamilia-605c5.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
