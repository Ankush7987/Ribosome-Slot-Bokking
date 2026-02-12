// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <--- ADDED THIS

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLJhJvak-Hfr3AWmFj_E3CiIR5q-NGnPQ",
  authDomain: "ribosomebooking.firebaseapp.com",
  projectId: "ribosomebooking",
  storageBucket: "ribosomebooking.firebasestorage.app",
  messagingSenderId: "506741684279",
  appId: "1:506741684279:web:eecd1c1eec8bc09717e7b2",
  measurementId: "G-9HL9WW4K2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); // <--- THIS WAS MISSING