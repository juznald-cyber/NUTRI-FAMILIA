import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyA2eq8zYeHBdTJDMKp_gdBPu5q8qYsDxI8",
  authDomain: "nutrifamilia-605c5.firebaseapp.com",
  projectId: "nutrifamilia-605c5",
  storageBucket: "nutrifamilia-605c5.firebasestorage.app",
  messagingSenderId: "624944210452",
  appId: "1:624944210452:web:a01d92ec5b3dcedf673d01",
  measurementId: "G-DW4K5927BV"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
