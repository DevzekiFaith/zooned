// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCPgqop5Yhz7S3rvH7QVfZpQSYtDNoYjfs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "onboarding-3eb95.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "onboarding-3eb95",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "onboarding-3eb95.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "8088933730",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:8088933730:web:2fa7c9641ef2eb7c48483b"
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase only once
let app;
try {
  validateFirebaseConfig();
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create a fallback app for development
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
  });
}

// Initialize services with error handling
export let auth: ReturnType<typeof getAuth>;
export let db: ReturnType<typeof getFirestore>;
export let storage: ReturnType<typeof getStorage>;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log('Firebase services initialized successfully');
  
  // Only connect to emulators in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      // Uncomment these lines if you want to use Firebase emulators in development
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (emulatorError) {
      console.warn('Firebase emulator connection failed:', emulatorError);
    }
  }
} catch (serviceError) {
  console.error('Firebase service initialization error:', serviceError);
  // Create fallback services to prevent import errors
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}