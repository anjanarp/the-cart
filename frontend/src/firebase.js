// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAK5vo2Sc6RRbzyUBra8w3_SaEMTt17ZE",
  authDomain: "cart-app-8ff35.firebaseapp.com",
  projectId: "cart-app-8ff35",
  storageBucket: "cart-app-8ff35.firebasestorage.app",
  messagingSenderId: "614105825428",
  appId: "1:614105825428:web:1334dac21bd5510d8fb481"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Auth and Google provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };