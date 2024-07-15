
import { initializeApp } from "firebase/app";
import{ getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBWE4hlsG-G6r-I4O0jUEC4fT23QPukzOI",
  authDomain: "amihanaauth.firebaseapp.com",
  projectId: "amihanaauth",
  storageBucket: "amihanaauth.appspot.com",
  messagingSenderId: "270817365412",
  appId: "1:270817365412:web:5728884dfbe89aa13dc531"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
export const storage = getStorage(app);