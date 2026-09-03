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
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'nutrifamilia_registered_users';
const ACTIVE_LOCAL_USER_KEY = 'nutrifamilia_active_user';

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
    // 1. Check local session first
    const savedLocalUser = localStorage.getItem(ACTIVE_LOCAL_USER_KEY);
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        setUser(parsed);
        setIsGuest(false);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse local session", e);
      }
    }

    // 2. Listen to Firebase Auth if active
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario'
          });
          setIsGuest(false);
          localStorage.removeItem('nutrifamilia_guest');
          localStorage.removeItem(ACTIVE_LOCAL_USER_KEY);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    const normalizedEmail = email.trim().toLowerCase();

    // First try Firebase Auth if possible
    try {
      const res = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      if (res.user) {
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || normalizedEmail.split('@')[0]
        });
        return;
      }
    } catch (fbErr: any) {
      // If Firebase key is invalid/not configured, fallback seamlessly to Local Multi-User Storage
      const isConfigIssue = !fbErr.code || 
        fbErr.code.includes('api-key') || 
        fbErr.code.includes('app-not-authorized') || 
        fbErr.code.includes('configuration-not-found') ||
        fbErr.code.includes('invalid-api-key') ||
        fbErr.code.includes('network-request-failed');

      const localUsers = getLocalUsers();
      const existingUser = localUsers.find(u => u.email === normalizedEmail);

      if (existingUser) {
        if (existingUser.passwordHash === pass) {
          const appUser: AppUser = {
            uid: existingUser.uid,
            email: existingUser.email,
            displayName: existingUser.name
          };
          setUser(appUser);
          localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(appUser));
          return;
        } else {
          throw { code: 'auth/wrong-password', message: 'Contraseña incorrecta' };
        }
      }

      if (!isConfigIssue) {
        throw fbErr;
      } else {
        throw { code: 'auth/user-not-found', message: 'Usuario no encontrado. Por favor crea una cuenta primero.' };
      }
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    setIsGuest(false);
    localStorage.removeItem('nutrifamilia_guest');
    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || normalizedEmail.split('@')[0];

    // Try Firebase first
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      if (userCredential.user) {
        if (name) {
          await updateProfile(userCredential.user, { displayName });
        }
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName
        });
        return;
      }
    } catch (fbErr: any) {
      // If Firebase config issue or offline, register in Local User Storage
      const localUsers = getLocalUsers();
      const existingUser = localUsers.find(u => u.email === normalizedEmail);

      if (existingUser) {
        throw { code: 'auth/email-already-in-use', message: 'Este correo ya está registrado.' };
      }

      // Create new local user with unique UID
      const newUid = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const newRecord: LocalUserRecord = {
        uid: newUid,
        email: normalizedEmail,
        name: displayName,
        passwordHash: pass
      };

      localUsers.push(newRecord);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

      const appUser: AppUser = {
        uid: newUid,
        email: normalizedEmail,
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
