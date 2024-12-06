// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQFfE1Pfgeq23E5Mx9xPS993Hfk9qBoaw",
  authDomain: "feedo-4d42b.firebaseapp.com",
  projectId: "feedo-4d42b",
  storageBucket: "feedo-4d42b.firebasestorage.app",
  messagingSenderId: "876140086317",
  appId: "1:876140086317:web:e91dd9ddb66acf8d4964a4",
  measurementId: "G-FZW5FM9YLY",
  linkedIn: {
    clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
    clientSecret: process.env.REACT_APP_LINKEDIN_CLIENT_SECRET
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Add LinkedIn provider configuration
const linkedInProvider = new OAuthProvider('linkedin.com');
linkedInProvider.addScope('r_emailaddress');
linkedInProvider.addScope('r_liteprofile');

// Export services
export { auth, db, storage, analytics, linkedInProvider }; 