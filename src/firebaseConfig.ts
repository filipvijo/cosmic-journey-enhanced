// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1SwycXvIedRzcwDGOLfqLLyIoZUBxr4o",
  authDomain: "cosmic-journey-6a83f.firebaseapp.com",
  projectId: "cosmic-journey-6a83f",
  storageBucket: "cosmic-journey-6a83f.appspot.com", // Corrected storageBucket format
  messagingSenderId: "1016806415310",
  appId: "1:1016806415310:web:349e6faa4419d5eab5299f",
  measurementId: "G-MTLJ2QPRLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };