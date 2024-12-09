import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjiTEDkM602t-vu72QEVwToFgJeIQkyb8",
  authDomain: "healthconsult-57a46.firebaseapp.com",
  projectId: "healthconsult-57a46",
  storageBucket: "healthconsult-57a46.appspot.com",
  messagingSenderId: "742364490583",
  appId: "1:742364490583:web:34e34c5f3903beb736ac12",
  measurementId: "G-WZMVF2WRHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
