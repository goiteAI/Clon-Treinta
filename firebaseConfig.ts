import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// MODO DE DEMOSTRACIÓN:
// Activado para evitar errores de API Key y permitir el despliegue.
// Para conectar a tu base de datos real, cambia a 'false' y
// ASEGÚRATE DE CONFIGURAR LAS VARIABLES DE ENTORNO EN VERCEL.
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


let auth: any;
let db: any;

// Conditionally initialize Firebase.
// This prevents the "invalid-api-key" error when running in DEMO_MODE without .env variables.
if (DEMO_MODE) {
  // In demo mode, these services are not used. Assign placeholders to satisfy exports.
  auth = {};
  db = {};
} else {
  // Initialize Firebase services for live mode.
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };