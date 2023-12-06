// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9AEXB-mR_6g9tQDguB6tRv7F2x2qjNUY",
  authDomain: "hahahahha-7cf64.firebaseapp.com",
  projectId: "hahahahha-7cf64",
  storageBucket: "hahahahha-7cf64.appspot.com",
  messagingSenderId: "23352828727",
  appId: "1:23352828727:web:3c7db0fbd0a75eb36d30b2",
  measurementId: "G-PM04P437KD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase
export const db = getFirestore(app);