// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDa3IhD7T6843_K7Z4Z_D98-kAUTdJihwM",
  authDomain: "timinggame-2ebe7.firebaseapp.com",
  projectId: "timinggame-2ebe7",
  storageBucket: "timinggame-2ebe7.firebasestorage.app",
  messagingSenderId: "514437973958",
  appId: "1:514437973958:web:77ae765f60f78e51f7d4c7",
  measurementId: "G-6V4TG44CMC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const analytics = getAnalytics(app);
export const db = getFirestore(app);
