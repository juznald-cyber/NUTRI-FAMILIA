import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  signInWithPopup, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { initCloudSync, stopCloudSync } from '../lib/syncService';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface LocalUserRecord {
  uid: string;
  email: string;
  name: string;
  passwordHash: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (emailOrUser: string, pass: string) => Promise<void>;
  signUp: (emailOrUser: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'nutrifamilia_registered_users';
const ACTIVE_LOCAL_USER_KEY = 'nutrifamilia_active_user';

// Helper to normalize username / email
export function normalizeEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  return `${trimmed}@nutrifamilia.app`;
}

export function getDeterministicUid(emailOrUser: string): string {
  const clean = normalizeEmail(emailOrUser).toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const cleanStr = clean.replace(/[^a-zA-Z0-9]/g, '_');
  return `usr_${Math.abs(hash).toString(36)}_${cleanStr.substring(0, 18)}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('nutrifamilia_guest') === 'true';
  });

  // Load registered local users
  const getLocalUsers = (): LocalUserRecord[] => {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    // 1. Check active local session first
    const savedLocalUser = localStorage.getItem(ACTIVE_LOCAL_USER_KEY);
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        // Normalize deterministic UID if it was a legacy random string
        if (parsed.email && parsed.uid && !parsed.uid.startsWith('usr_')) {
          // Firebase UID - keep as is
          setUser(parsed);
        } else if (parsed.email) {
          const detUid = getDeterministicUid(parsed.email);
          const updatedUser = { ...parsed, uid: detUid };
          setUser(updatedUser);
          localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(updatedUser));
        } else {
          setUser(parsed);
        }
        setIsGuest(false);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse local session", e);
      }
    }

    // 2. Listen to Firebase Auth
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          const appUser: AppUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario'
          };
          setUser(appUser);
          setIsGuest(false);
          localStorage.removeItem('nutrifamilia_guest');
          localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 3. Initialize Cloud Sync when authenticated user is active
  useEffect(() => {
    if (user && user.uid && user.uid !== 'guest_user' && !isGuest) {
      initCloudSync(user.uid);
    } else {
      stopCloudSync();
    }
    return () => {
      stopCloudSync();
    };
  }, [user, isGuest]);

  const signIn = async (emailOrUser: string, pass: string) => {
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    const normalized = normalizeEmail(emailOrUser);
    const deterministicUid = getDeterministicUid(normalized);
    const displayName = emailOrUser.trim().split('@')[0];

    // 1. Try Firebase Auth first
    try {
      const res = await signInWithEmailAndPassword(auth, normalized, pass);
      if (res.user) {
        const appUser: AppUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || displayName
        };
        setUser(appUser);
        localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
        return;
      }
    } catch (fbErr: any) {
      console.log("Firebase signIn info:", fbErr?.code);

      // Check local user database fallback
      const localUsers = getLocalUsers();
      const existingUser = localUsers.find(u => u.email === normalized || u.email.split('@')[0] === emailOrUser.trim().toLowerCase());

      if (existingUser) {
        if (existingUser.passwordHash === pass) {
          const appUser: AppUser = {
            uid: deterministicUid,
            email: existingUser.email,
            displayName: existingUser.name
          };
          setUser(appUser);
          localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
          return;
        } else {
          throw { code: 'auth/wrong-password', message: 'Contraseña incorrecta.' };
        }
      }

      // If logging in on a new device without local storage copy yet, allow automatic sync
      const appUser: AppUser = {
        uid: deterministicUid,
        email: normalized,
        displayName
      };

      const newRecord: LocalUserRecord = {
        uid: deterministicUid,
        email: normalized,
        name: displayName,
        passwordHash: pass
      };
      localUsers.push(newRecord);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

      setUser(appUser);
      localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
    }
  };

  const signUp = async (emailOrUser: string, pass: string, name?: string) => {
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    const normalized = normalizeEmail(emailOrUser);
    const displayName = name?.trim() || emailOrUser.trim().split('@')[0];
    const deterministicUid = getDeterministicUid(normalized);

    // Try Firebase first
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalized, pass);
      if (userCredential.user) {
        if (name) {
          await updateProfile(userCredential.user, { displayName });
        }
        const appUser: AppUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName
        };
        setUser(appUser);
        localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
        return;
      }
    } catch (fbErr: any) {
      console.log("Firebase signUp info:", fbErr?.code);

      // Register in Local Storage if Firebase offline or already exists
      const localUsers = getLocalUsers();
      const existingUser = localUsers.find(u => u.email === normalized);

      if (existingUser) {
        const appUser: AppUser = {
          uid: deterministicUid,
          email: normalized,
          displayName
        };
        setUser(appUser);
        localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
        return;
      }

      const newRecord: LocalUserRecord = {
        uid: deterministicUid,
        email: normalized,
        name: displayName,
        passwordHash: pass
      };

      localUsers.push(newRecord);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

      const appUser: AppUser = {
        uid: deterministicUid,
        email: normalized,
        displayName
      };

      setUser(appUser);
      localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
    }
  };

  const signInWithGoogle = async () => {
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      signInAsGuest();
    }
  };

  const signOut = async () => {
    stopCloudSync();
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    localStorage.removeItem(ACTIVE_LOCAL_USER_KEY);
    setUser(null);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.log('Firebase signOut error', e);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('nutrifamilia_guest', 'true');
    localStorage.removeItem(ACTIVE_LOCAL_USER_KEY);
    setUser({
      uid: 'guest_user',
      email: 'invitado@nutrifamilia.app',
      displayName: 'Invitado'
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      isGuest,
      signInAsGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
