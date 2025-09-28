// FIX: Updated Firebase imports to use the v9 compatibility layer. This allows the existing v8 syntax to work with newer versions of the Firebase SDK (v9+), resolving errors where properties like 'apps', 'initializeApp', 'auth', and 'firestore' were not found on the imported 'firebase' object.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// MODO DE DEMOSTRACIÓN ACTIVADO PARA PRUEBAS EN VERCEL
// La app usará datos locales y no intentará conectar con Firebase.
// Cambiar a 'false' para reactivar la conexión a Firebase.
export const DEMO_MODE = true;

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTaOzJtnE-56lBUesgO_HDTBsoDAm95V0",
    authDomain: "gestiona-tu-negocio-8249a.firebaseapp.com",
    projectId: "gestiona-tu-negocio-8249a",
    storageBucket: "gestiona-tu-negocio-8249a.appspot.com",
    messagingSenderId: "537652131003",
    appId: "1:537652131003:web:3dd12b7151d55634b9a59e"
};


let auth: any;
let db: any;
let firebaseInitialized = false;

// Initialize Firebase services only if not in demo mode.
if (!DEMO_MODE) {
  try {
    // FIX: Switched to v8 initialization syntax.
    // Added a check to prevent re-initialization on hot reloads.
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    firebaseInitialized = false;
  }
}


export { auth, db, firebaseInitialized };