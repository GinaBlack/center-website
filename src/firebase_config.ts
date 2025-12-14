import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "export.meta.env.VITE_FIREBASE_API_KEY",
  authDomain: "export.meta.env.VITE_FIREBASE_AUTH_DOMAIN",
  databaseURL: "export.meta.env.VITE_FIREBASE_DATABASE_URL",
  projectId: "export.meta.env.VITE_FIREBASE_PROJECT_ID",
  storageBucket: "  export.meta.env.VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "export.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "export.meta.env.VITE_FIREBASE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

