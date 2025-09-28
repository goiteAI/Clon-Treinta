import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// DEVELOPMENT TOGGLE:
// Set this to 'true' to run the app in demo mode without connecting to Firebase.
// The app will use local mock data and you won't need to log in.
// Set this to 'false' to connect to your live Firebase backend.
export const DEMO_MODE = false;

// Configuration from your Firebase project - now loaded from environment variables
// Vite's 'define' feature replaces these process.env variables with string literals during build.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);