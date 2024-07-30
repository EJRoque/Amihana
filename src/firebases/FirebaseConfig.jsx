
import { initializeApp } from "firebase/app";
import{ getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBeMGlvr9Ha3_j5dQcuz_snSARuO9Vk03o",
  authDomain: "amihanamain-a5754.firebaseapp.com",
  projectId: "amihanamain-a5754",
  storageBucket: "amihanamain-a5754.appspot.com",
  messagingSenderId: "790814082705",
  appId: "1:790814082705:web:c0260f7cb9efc0b9fa6130"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
export const storage = getStorage(app);