import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
} from 'firebase/firestore';

// Read config from auto-provisioned firebase-applet-config.json
let firebaseConfig: any = {
  projectId: "steadfast-skyline-v8kj5",
  appId: "1:817062690867:web:5287578fe46a3484186346",
  apiKey: "AIzaSyATX8azNtb3Z8H4JP7Xkgym-HbtUIK1WvQ",
  authDomain: "steadfast-skyline-v8kj5.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-routesensefleetv-6118dbbc-3d33-40ef-84d1-f50ee39f4bf2",
  storageBucket: "steadfast-skyline-v8kj5.firebasestorage.app",
  messagingSenderId: "817062690867",
  oAuthClientId: "817062690867-0oo6fj1o14hgg9m1cvb4si133uo67igp.apps.googleusercontent.com"
};

try {
  // If in browser, window or import could exist, fallback to static config above
} catch (e) {
  // Ignore
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
};
export type { FirebaseUser };
