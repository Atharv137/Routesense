import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { RouteSenseStorage } from '../services/storage';
import { INITIAL_USERS } from '../data/mockData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (emailOrPhone: string, password?: string) => Promise<boolean> | boolean;
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  signup: (userData: Omit<User, 'uid' | 'createdAt'>) => Promise<void> | void;
  logout: () => Promise<void> | void;
  switchUser: (uid: string) => void;
  allUsers: User[];
  showSplash: boolean;
  dismissSplash: () => void;
  isLoading: boolean;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => RouteSenseStorage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => RouteSenseStorage.getUsers());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('rs_splash_shown');
  });

  // Sync with Firebase Auth state if user signs in with Google
  useEffect(() => {
    RouteSenseStorage.init();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let appUser: User;
          if (userSnap.exists()) {
            appUser = userSnap.data() as User;
          } else {
            // New Google authenticated user: create commuter passenger profile
            appUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Google User',
              email: firebaseUser.email || `${firebaseUser.uid}@routesense.in`,
              phone: firebaseUser.phoneNumber || '+91 98765 00000',
              role: 'passenger',
              profilePhoto: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, appUser);
          }

          RouteSenseStorage.saveUser(appUser);
          setCurrentUserState(appUser);
        } catch (err) {
          console.warn('Could not sync user from Firestore:', err);
        }
      }
    });

    const handleAuthChange = (e: any) => {
      setCurrentUserState(e.detail);
      setAllUsers(RouteSenseStorage.getUsers());
    };

    window.addEventListener('rs_auth_change', handleAuthChange);
    return () => {
      unsubscribe();
      window.removeEventListener('rs_auth_change', handleAuthChange);
    };
  }, []);

  const setCurrentUser = (user: User | null) => {
    RouteSenseStorage.setCurrentUser(user);
    setCurrentUserState(user);
  };

  const loginWithGoogle = async (preferredRole: UserRole = 'passenger'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let appUser: User;
      if (userSnap.exists()) {
        appUser = userSnap.data() as User;
      } else {
        appUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google Commuter',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '+91 98765 43210',
          role: preferredRole,
          profilePhoto: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          employeeId: preferredRole !== 'passenger' ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          shiftStatus: preferredRole !== 'passenger' ? 'on_duty' : undefined,
        };
        await setDoc(userDocRef, appUser);
      }

      RouteSenseStorage.saveUser(appUser);
      setCurrentUser(appUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      setIsLoading(false);
      // Helpful fallback in case popup blocked or test domain
      return { success: false, error: error.message || 'Google Sign-in was cancelled or encountered an error.' };
    }
  };

  const login = (emailOrPhone: string): boolean => {
    const users = RouteSenseStorage.getUsers();
    const cleanQuery = emailOrPhone.trim().toLowerCase();
    const matched = users.find(
      u => u.email.toLowerCase() === cleanQuery || u.phone.replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, '')
    );
    if (matched) {
      setCurrentUser(matched);
      return true;
    }
    return false;
  };

  const loginAsRole = (role: UserRole) => {
    const users = RouteSenseStorage.getUsers();
    let userForRole = users.find(u => u.role === role);
    if (!userForRole) {
      userForRole = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
      RouteSenseStorage.saveUser(userForRole);
    }
    setCurrentUser(userForRole);
  };

  const signup = async (userData: Omit<User, 'uid' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      uid: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore if available
    try {
      await setDoc(doc(db, 'users', newUser.uid), newUser);
    } catch (e) {
      console.warn('Firestore user save fallback to local:', e);
    }

    RouteSenseStorage.saveUser(newUser);
    setCurrentUser(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
    setCurrentUser(null);
  };

  const switchUser = (uid: string) => {
    const users = RouteSenseStorage.getUsers();
    const target = users.find(u => u.uid === uid);
    if (target) {
      setCurrentUser(target);
    }
  };

  const dismissSplash = () => {
    sessionStorage.setItem('rs_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        loginWithGoogle,
        loginAsRole,
        signup,
        logout,
        switchUser,
        allUsers,
        showSplash,
        dismissSplash,
        isLoading,
        isFirebaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
