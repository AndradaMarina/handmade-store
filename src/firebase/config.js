import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDWNBRvi4Lt2MrJW3BpIJ7APckvewHSlmg",
  authDomain: "e-commerce-handmade.firebaseapp.com",
  projectId: "e-commerce-handmade",
  storageBucket: "e-commerce-handmade.firebasestorage.app",
  messagingSenderId: "891034095334",
  appId: "1:891034095334:web:e1b99fa01fbfaf1c12b527"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);