import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// MODO DE DEMOSTRACIÓN DESACTIVADO
// Se utilizará la configuración real de Firebase proporcionada.
export const DEMO_MODE = false;

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

// Initialize Firebase services for live mode.
const app = initializeApp(firebaseConfig);
auth = getAuth(app);
db = getFirestore(app);
firebaseInitialized = true;


export { auth, db, firebaseInitialized };