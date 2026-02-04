
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciales temporales para evitar fallos de inicialización nula
const firebaseConfig = {
  apiKey: "AIzaSyAsFakeKey_OnlyForInterfaceDemo",
  authDomain: "global-finances.firebaseapp.com",
  projectId: "global-finances",
  storageBucket: "global-finances.appspot.com",
  messagingSenderId: "123",
  appId: "1:123:web:abc"
};

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (e) {
  console.warn("Firebase initialization failed, using mock app instance.");
  app = { name: "[DEFAULT]" } as any;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
