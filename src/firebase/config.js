import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDWNBRvi4Lt2MrJW3BpIJ7APckvewHSlmg",
  authDomain: "e-commerce-handmade.firebaseapp.com",
  projectId: "e-commerce-handmade",
  storageBucket: "e-commerce-handmade.firebasestorage.app",
  messagingSenderId: "891034095334",
  appId: "1:891034095334:web:e1b99fa01fbfaf1c12b527",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider(); // pentru autentificare cu Google

export { db, auth, storage, googleProvider };
