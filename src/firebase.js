// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIgsIFmZZs9tWGN2vLPyTwao4_Cl2jZTc",
  authDomain: "clothingpicker-66687.firebaseapp.com",
  projectId: "clothingpicker-66687",
  storageBucket: "clothingpicker-66687.firebasestorage.app",
  messagingSenderId: "55697675030",
  appId: "1:55697675030:web:8e98c96c623120042db637",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app); 