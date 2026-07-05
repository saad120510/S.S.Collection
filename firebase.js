// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAU1gLehEWH3K8kBv2B6mRZuGLbK8oq8GU",
  authDomain: "ss-collection-5a953.firebaseapp.com",
  projectId: "ss-collection-5a953",
  storageBucket: "ss-collection-5a953.firebasestorage.app",
  messagingSenderId: "540006344741",
  appId: "1:540006344741:web:0c9e15362f4d2d8ccdf7cc",
  measurementId: "G-TFK4WVV31S"
};

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Authentication
export const auth = getAuth(app);

console.log("Firebase Connected Successfully");