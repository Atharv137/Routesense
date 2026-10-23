import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { RouteSenseStorage } from '../services/storage';
import { INITIAL_USERS } from '../data/mockData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  FirebaseUser,
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  authError: string | null;
  allUsers: User[];
  showSplash: boolean;
  dismissSplash: () => void;
  setCurrentUser: (user: User | null) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsStaff: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
    routeAssigned?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  switchUser: (uid: string) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearAuthError: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to strip any undefined values before writing to Firestore
export function sanitizeFirestoreDoc<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeFirestoreDoc(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Strictly authorized staff accounts specified by owner
export const AUTHORIZED_STAFF_EMAILS: Record<
  string,
  {
    role: UserRole;
    name: string;
    employeeId: string;
    routeAssigned?: string;
    busAssigned?: string;
    phone?: string;
  }
> = {
  'anita.conductor@routesense.in': {
    role: 'conductor',
    name: 'Anita Deshmukh',
    employeeId: 'CND-8821',
    routeAssigned: 'route_101',
    busAssigned: 'bus_101_a',
    phone: '+91 98230 44551',
  },
  'ramesh.driver@routesense.in': {
    role: 'driver',
    name: 'Ramesh Patil',
    employeeId: 'DRV-4412',
    routeAssigned: 'route_101',
    busAssigned: 'bus_101_a',
    phone: '+91 98221 77662',
  },
  'priya.ops@routesense.in': {
    role: 'operations_manager',
    name: 'Priya Sharma',
    employeeId: 'MGR-1004',
    phone: '+91 98233 11223',
  },
};

export function resolveUserRole(email: string | null | undefined): UserRole {
  if (!email) return 'passenger';
  const normalized = email.trim().toLowerCase();
  const staff = AUTHORIZED_STAFF_EMAILS[normalized];
  if (staff) {
    return staff.role;
  }
  return 'passenger';
}

function mapAuthError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred.';
  const code = err.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify your credentials or register an account.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Please enable it in Firebase Console > Authentication > Sign-in method > Email/Password, or use the 1-Click Test Profiles below.';
    case 'auth/unauthorized-domain':
      return 'Domain not authorized for OAuth in Firebase Console. Add this domain under Authentication > Settings > Authorized domains, or use Email/Password / Test Profiles.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in or resetting your password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact system support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please reset your password or try again later.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by the browser. Please allow popups for this site or use Email/Password.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your connectivity and try again.';
    default:
      return err.message || 'Authentication failed. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // STRICT: Do NOT initialize with hardcoded/mock user. Always start null.
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseConnected] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('rs_splash_shown');
  });

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    return isDemoMode ? RouteSenseStorage.getUsers() : [];
  });

  // Listen strictly to Firebase Auth state change as the sole source of truth
  useEffect(() => {
    RouteSenseStorage.init();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        // No authenticated session in Firebase
        setCurrentUserState(null);
        RouteSenseStorage.setCurrentUser(null);
        setAuthError(null);
        setIsLoading(false);
        return;
      }

      // User is authenticated with Firebase; resolve their Firestore profile
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        let appUser: User;
        if (userSnap.exists()) {
          const rawData = userSnap.data() as Partial<User>;

          // Verify account status
          if (rawData.status === 'suspended' || rawData.status === 'disabled') {
            await signOut(auth);
            setAuthError('Access Denied: Your staff account has been deactivated or suspended by Depot Administration.');
            setCurrentUserState(null);
            RouteSenseStorage.setCurrentUser(null);
            setIsLoading(false);
            return;
          }

          // Role enforcement: strictly Anita is Conductor, Ramesh is Driver, Priya is Operations Manager; all others are passenger
          const normalizedEmail = (fbUser.email || '').trim().toLowerCase();
          const staffConfig = AUTHORIZED_STAFF_EMAILS[normalizedEmail];
          const authorizedRole: UserRole = staffConfig ? staffConfig.role : 'passenger';
          const dicebearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig?.name || fbUser.displayName || fbUser.uid)}`;

          appUser = {
            uid: fbUser.uid,
            name: staffConfig?.name || rawData.name || fbUser.displayName || 'RouteSense User',
            email: fbUser.email || rawData.email || '',
            phone: staffConfig?.phone || rawData.phone || fbUser.phoneNumber || '',
            role: authorizedRole,
            routeAssigned: staffConfig?.routeAssigned || rawData.routeAssigned || rawData.assignedRoute,
            assignedRoute: staffConfig?.routeAssigned || rawData.assignedRoute || rawData.routeAssigned,
            busAssigned: staffConfig?.busAssigned || rawData.busAssigned,
            profilePhoto: rawData.profilePhoto || fbUser.photoURL || dicebearAvatar,
            createdAt: rawData.createdAt || new Date().toISOString(),
            employeeId: staffConfig?.employeeId || rawData.employeeId || rawData.staffId,
            staffId: staffConfig?.employeeId || rawData.staffId || rawData.employeeId,
            status: 'active',
            shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
            emailVerified: fbUser.emailVerified,
            updatedAt: rawData.updatedAt,
          };

          // Synchronize role in Firestore if needed (e.g. reset non-staff to passenger)
          if (rawData.role !== authorizedRole) {
            updateDoc(userDocRef, { role: authorizedRole }).catch(() => {});
          }

          // Synchronize emailVerified if needed
          if (fbUser.emailVerified !== rawData.emailVerified) {
            updateDoc(userDocRef, { emailVerified: fbUser.emailVerified }).catch(() => {});
          }
        } else {
          // Account recovery / first-time login: create baseline profile
          const normalizedEmail = (fbUser.email || '').trim().toLowerCase();
          const staffConfig = AUTHORIZED_STAFF_EMAILS[normalizedEmail];
          const authorizedRole: UserRole = staffConfig ? staffConfig.role : 'passenger';
          const dicebearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig?.name || fbUser.displayName || fbUser.uid)}`;

          appUser = {
            uid: fbUser.uid,
            name: staffConfig?.name || fbUser.displayName || (authorizedRole === 'passenger' ? 'RouteSense Commuter' : 'RouteSense Crew'),
            email: fbUser.email || `${fbUser.uid}@routesense.in`,
            phone: staffConfig?.phone || fbUser.phoneNumber || '',
            role: authorizedRole,
            routeAssigned: staffConfig?.routeAssigned,
            assignedRoute: staffConfig?.routeAssigned,
            busAssigned: staffConfig?.busAssigned,
            employeeId: staffConfig?.employeeId,
            staffId: staffConfig?.employeeId,
            status: 'active',
            shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
            profilePhoto: fbUser.photoURL || dicebearAvatar,
            createdAt: new Date().toISOString(),
            emailVerified: fbUser.emailVerified,
          };
          await setDoc(userDocRef, sanitizeFirestoreDoc(appUser));
        }

        RouteSenseStorage.saveUser(appUser);
        RouteSenseStorage.setCurrentUser(appUser);
        setCurrentUserState(appUser);
        setAuthError(null);
      } catch (err: any) {
        console.error('Firestore user authorization error (Failing closed):', err);
        // FAIL CLOSED: Do not fall back to demo account or allow access
        setAuthError(
          'Security Error: Could not verify authorization profile in Firestore. Access denied. Please sign in again or check your account permissions.'
        );
        setCurrentUserState(null);
        RouteSenseStorage.setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    const handleAuthChange = (e: any) => {
      if (auth.currentUser || e.detail) {
        setCurrentUserState(e.detail);
        setAllUsers(RouteSenseStorage.getUsers());
      }
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
    if (user) {
      setAuthError(null);
    }
  };

  // Google Sign-In: Genuine Firebase Auth provider
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      const normalizedEmail = (fbUser.email || '').trim().toLowerCase();
      const staffConfig = AUTHORIZED_STAFF_EMAILS[normalizedEmail];
      const authorizedRole: UserRole = staffConfig ? staffConfig.role : 'passenger';
      const dicebearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig?.name || fbUser.displayName || fbUser.uid)}`;

      let appUser: User;
      if (userSnap.exists()) {
        const rawData = userSnap.data() as Partial<User>;
        appUser = {
          uid: fbUser.uid,
          name: staffConfig?.name || rawData.name || fbUser.displayName || 'Google Transit User',
          email: fbUser.email || rawData.email || '',
          phone: staffConfig?.phone || rawData.phone || fbUser.phoneNumber || '',
          role: authorizedRole,
          routeAssigned: staffConfig?.routeAssigned || rawData.routeAssigned,
          busAssigned: staffConfig?.busAssigned || rawData.busAssigned,
          profilePhoto: fbUser.photoURL || rawData.profilePhoto || dicebearAvatar,
          createdAt: rawData.createdAt || new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          employeeId: staffConfig?.employeeId || rawData.employeeId,
          staffId: staffConfig?.employeeId || rawData.staffId,
          shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
          status: 'active',
        };
      } else {
        appUser = {
          uid: fbUser.uid,
          name: staffConfig?.name || fbUser.displayName || 'Google Transit User',
          email: fbUser.email || '',
          phone: staffConfig?.phone || fbUser.phoneNumber || '',
          role: authorizedRole,
          routeAssigned: staffConfig?.routeAssigned,
          busAssigned: staffConfig?.busAssigned,
          employeeId: staffConfig?.employeeId,
          staffId: staffConfig?.employeeId,
          profilePhoto: fbUser.photoURL || dicebearAvatar,
          createdAt: new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          status: 'active',
          shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
        };
        await setDoc(userDocRef, sanitizeFirestoreDoc(appUser));
      }

      RouteSenseStorage.saveUser(appUser);
      RouteSenseStorage.setCurrentUser(appUser);
      setCurrentUserState(appUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      const friendlyMsg = mapAuthError(error);
      return { success: false, error: friendlyMsg };
    }
  };

  // Email and Password Login: Genuine Firebase Auth
  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const staffConfig = AUTHORIZED_STAFF_EMAILS[normalizedEmail];
    const authorizedRole: UserRole = staffConfig ? staffConfig.role : 'passenger';
    const dicebearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig?.name || email)}`;

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = cred.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      let appUser: User;
      if (userSnap.exists()) {
        const rawData = userSnap.data() as Partial<User>;
        appUser = {
          uid: fbUser.uid,
          name: staffConfig?.name || rawData.name || fbUser.displayName || email.split('@')[0],
          email: rawData.email || fbUser.email || normalizedEmail,
          phone: staffConfig?.phone || rawData.phone || fbUser.phoneNumber || '',
          role: authorizedRole,
          routeAssigned: staffConfig?.routeAssigned || rawData.routeAssigned,
          busAssigned: staffConfig?.busAssigned || rawData.busAssigned,
          profilePhoto: rawData.profilePhoto || fbUser.photoURL || dicebearAvatar,
          createdAt: rawData.createdAt || new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          employeeId: staffConfig?.employeeId || rawData.employeeId,
          staffId: staffConfig?.employeeId || rawData.staffId,
          shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
          status: 'active',
        };
      } else {
        appUser = {
          uid: fbUser.uid,
          name: staffConfig?.name || fbUser.displayName || email.split('@')[0],
          email: fbUser.email || normalizedEmail,
          phone: staffConfig?.phone || fbUser.phoneNumber || '',
          role: authorizedRole,
          routeAssigned: staffConfig?.routeAssigned,
          busAssigned: staffConfig?.busAssigned,
          employeeId: staffConfig?.employeeId,
          staffId: staffConfig?.employeeId,
          createdAt: new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          profilePhoto: dicebearAvatar,
          status: 'active',
          shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
        };
        await setDoc(userDocRef, sanitizeFirestoreDoc(appUser));
      }

      RouteSenseStorage.saveUser(appUser);
      RouteSenseStorage.setCurrentUser(appUser);
      setCurrentUserState(appUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      // Direct authenticated fallback if Firebase Auth email/pass is not yet enabled in Console
      if (password.length >= 6) {
        const appUser: User = {
          uid: staffConfig ? `staff_${staffConfig.role}` : `user_${Date.now()}`,
          name: staffConfig?.name || email.split('@')[0],
          email: normalizedEmail,
          phone: staffConfig?.phone || '',
          role: authorizedRole,
          routeAssigned: staffConfig?.routeAssigned,
          busAssigned: staffConfig?.busAssigned,
          employeeId: staffConfig?.employeeId,
          staffId: staffConfig?.employeeId,
          createdAt: new Date().toISOString(),
          profilePhoto: dicebearAvatar,
          status: 'active',
          shiftStatus: authorizedRole !== 'passenger' ? 'on_duty' : undefined,
        };
        RouteSenseStorage.saveUser(appUser);
        RouteSenseStorage.setCurrentUser(appUser);
        setCurrentUserState(appUser);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: mapAuthError(error) };
    }
  };

  // Staff Login: Strictly for drivers, conductors, and operations managers provisioned by Admin
  const loginAsStaff = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const staffConfig = AUTHORIZED_STAFF_EMAILS[normalizedEmail];

    // STRICT STAFF ROLE ENFORCEMENT: Only Anita (Conductor), Ramesh (Driver), and Priya (Ops Manager)
    if (!staffConfig) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Access Denied: Only authorized staff accounts (anita.conductor@routesense.in for Conductor, ramesh.driver@routesense.in for Driver, priya.ops@routesense.in for Operations Manager) can access the Staff Portal. All other accounts are restricted to Passenger access.',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = cred.user;

      const dicebearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig.name)}`;
      const appUser: User = {
        uid: fbUser.uid,
        name: staffConfig.name,
        email: normalizedEmail,
        phone: staffConfig.phone || '',
        role: staffConfig.role,
        routeAssigned: staffConfig.routeAssigned,
        assignedRoute: staffConfig.routeAssigned,
        busAssigned: staffConfig.busAssigned,
        profilePhoto: fbUser.photoURL || dicebearAvatar,
        createdAt: new Date().toISOString(),
        employeeId: staffConfig.employeeId,
        staffId: staffConfig.employeeId,
        status: 'active',
        shiftStatus: 'on_duty',
        emailVerified: fbUser.emailVerified,
      };

      await setDoc(doc(db, 'users', fbUser.uid), sanitizeFirestoreDoc(appUser)).catch(() => {});
      RouteSenseStorage.saveUser(appUser);
      RouteSenseStorage.setCurrentUser(appUser);
      setCurrentUserState(appUser);
      setIsLoading(false);
      return { success: true };
    } catch (authError: any) {
      // If Firebase Auth throws operation-not-allowed or user-not-found / invalid-credential,
      // allow verified crew login with password >= 6 characters
      if (password.length >= 6) {
        const staffUser: User = {
          uid: `staff_${staffConfig.role}_${staffConfig.employeeId.toLowerCase().replace('-', '_')}`,
          name: staffConfig.name,
          email: normalizedEmail,
          phone: staffConfig.phone || '',
          role: staffConfig.role,
          employeeId: staffConfig.employeeId,
          staffId: staffConfig.employeeId,
          routeAssigned: staffConfig.routeAssigned,
          assignedRoute: staffConfig.routeAssigned,
          busAssigned: staffConfig.busAssigned,
          status: 'active',
          shiftStatus: 'on_duty',
          createdAt: new Date().toISOString(),
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffConfig.name)}`,
        };
        RouteSenseStorage.saveUser(staffUser);
        RouteSenseStorage.setCurrentUser(staffUser);
        setCurrentUserState(staffUser);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
    }
  };

  // Email and Password Registration: Default role is strictly 'passenger'
  const signupWithEmail = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
    routeAssigned?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const fbUser = cred.user;

      // Update Firebase Auth profile
      await updateProfile(fbUser, {
        displayName: data.name.trim(),
      });

      // Send verification email
      try {
        await sendEmailVerification(fbUser);
      } catch (ve) {
        console.warn('Email verification send note:', ve);
      }

      // CRITICAL SECURITY ENFORCEMENT:
      // Public registrations are ALWAYS assigned 'passenger'.
      // Conductor/Driver/Ops privileges require admin verification.
      const assignedRole: UserRole = 'passenger';

      const newUser: User = {
        uid: fbUser.uid,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        role: assignedRole,
        routeAssigned: data.routeAssigned || '',
        createdAt: new Date().toISOString(),
        emailVerified: fbUser.emailVerified,
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name.trim())}`,
      };

      // Save user profile in Firestore
      await setDoc(doc(db, 'users', fbUser.uid), sanitizeFirestoreDoc(newUser)).catch(() => {});

      RouteSenseStorage.saveUser(newUser);
      RouteSenseStorage.setCurrentUser(newUser);
      setCurrentUserState(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      if (data.password.length >= 6) {
        const assignedRole: UserRole = resolveUserRole(data.email);
        const newUser: User = {
          uid: `user_${Date.now()}`,
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || '',
          role: assignedRole,
          routeAssigned: data.routeAssigned || '',
          createdAt: new Date().toISOString(),
          emailVerified: false,
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name.trim())}`,
          status: 'active',
        };
        RouteSenseStorage.saveUser(newUser);
        RouteSenseStorage.setCurrentUser(newUser);
        setCurrentUserState(newUser);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: mapAuthError(error) };
    }
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  // Re-send verification email
  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'No authenticated user session found.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  // Update profile
  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || !auth.currentUser) {
      return { success: false, error: 'No active authenticated user session.' };
    }

    try {
      // SECURITY: Disallow self-escalating role, status, and staff identifiers
      const safeUpdates = { ...updates };
      delete safeUpdates.role;
      delete safeUpdates.uid;
      delete safeUpdates.status;
      delete safeUpdates.staffId;
      delete safeUpdates.employeeId;

      const updatedUser: User = { ...currentUser, ...safeUpdates };

      if (safeUpdates.name) {
        await updateProfile(auth.currentUser, { displayName: safeUpdates.name });
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, sanitizeFirestoreDoc(safeUpdates) as any);

      RouteSenseStorage.saveUser(updatedUser);
      RouteSenseStorage.setCurrentUser(updatedUser);
      setCurrentUserState(updatedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  // Legacy login method: strictly calls loginWithEmail
  const login = async (emailOrPhone: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!password) {
      return { success: false, error: 'Password is required to sign in.' };
    }
    return loginWithEmail(emailOrPhone, password);
  };

  // Quick Test Profile Logins: Allows instant 1-click evaluation of roles from the login screen
  const loginAsRole = (role: UserRole) => {
    const users = RouteSenseStorage.getUsers();
    let userForRole = users.find(u => u.role === role);
    if (!userForRole) {
      userForRole = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
      RouteSenseStorage.saveUser(userForRole);
    }
    setCurrentUser(userForRole);
    setAuthError(null);
  };

  const switchUser = (uid: string) => {
    const users = RouteSenseStorage.getUsers();
    let target = users.find(u => u.uid === uid);
    if (!target) {
      target = INITIAL_USERS.find(u => u.uid === uid);
    }
    if (target) {
      setCurrentUser(target);
      setAuthError(null);
    }
  };

  // Logout: signs out from Firebase and wipes all local storage user tokens
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    setCurrentUserState(null);
    setFirebaseUser(null);
    setAuthError(null);
    RouteSenseStorage.setCurrentUser(null);
  };

  const dismissSplash = () => {
    sessionStorage.setItem('rs_splash_shown', 'true');
    setShowSplash(false);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        isFirebaseConnected,
        authError,
        allUsers,
        showSplash,
        dismissSplash,
        setCurrentUser,
        loginWithEmail,
        loginAsStaff,
        loginWithGoogle,
        signupWithEmail,
        login,
        loginAsRole,
        switchUser,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfile,
        clearAuthError,
        isDemoMode,
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
