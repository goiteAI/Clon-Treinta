import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// DEVELOPMENT TOGGLE:
// Set this to 'true' to run the app in demo mode without connecting to Firebase.
// The app will use local mock data and you won't need to log in.
// Set this to 'false' to connect to your live Firebase backend.
export const DEMO_MODE = true;

// Configuration from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyCTaOzJtnE-56lBUesgO_HDTBsoDAm95V0",
  authDomain: "gestiona-tu-negocio-8249a.firebaseapp.com",
  projectId: "gestiona-tu-negocio-8249a",
  storageBucket: "gestiona-tu-negocio-8249a.appspot.com",
  messagingSenderId: "537652131003",
  appId: "1:537652131003:web:3dd12b7151d55634b9a59e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
