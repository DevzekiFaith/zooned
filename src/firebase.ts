// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPgqop5Yhz7S3rvH7QVfZpQSYtDNoYjfs",
  authDomain: "onboarding-3eb95.firebaseapp.com",
  projectId: "onboarding-3eb95",
  storageBucket: "onboarding-3eb95.appspot.com", // Corrected bucket domain
  messagingSenderId: "8088933730",
  appId: "1:8088933730:web:2fa7c9641ef2eb7c48483b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export storage