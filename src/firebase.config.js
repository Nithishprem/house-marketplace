// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGLKMS20zrnWH0Wp5Fii-d4shiFXgXL6k",
  authDomain: "house-marketplace-app-70c8a.firebaseapp.com",
  projectId: "house-marketplace-app-70c8a",
  storageBucket: "house-marketplace-app-70c8a.appspot.com",
  messagingSenderId: "871718728110",
  appId: "1:871718728110:web:9ef9294277130fcead183f"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore()