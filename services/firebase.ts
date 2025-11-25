

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS0KfPFNs4OUWxIUBvBu0aBgRq28MaGG0",
  authDomain: "bloxm1.firebaseapp.com",
  projectId: "bloxm1",
  storageBucket: "bloxm1.firebasestorage.app",
  messagingSenderId: "54371909788",
  appId: "1:54371909788:web:c338e8b0243f992b31ad59",
  measurementId: "G-XGRBT9FP02"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err) {
    // Error is handled in the UI component
    throw err;
  }
};

export const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (err) {
    throw err;
  }
};

export const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    return res.user;
  } catch (err) {
    throw err;
  }
};

export const loginAsGuest = async () => {
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (err) {
    throw err;
  }
};

export const logout = () => signOut(auth);

export const saveUserData = async (uid: string, data: any) => {
    try {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
    } catch (e) {
        console.error("Error saving user data to Firestore", e);
    }
}

export const loadUserData = async (uid: string) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (e) {
        console.error("Error loading user data from Firestore", e);
    }
    return null;
}

export { auth, onAuthStateChanged, db };
export type { User };