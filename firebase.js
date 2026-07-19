// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmM3b2E3t2EAjdLGeXjoRVw_YdEln43jA",
  authDomain: "login-mural.firebaseapp.com",
  projectId: "login-mural",
  storageBucket: "login-mural.firebasestorage.app",
  messagingSenderId: "86320118727",
  appId: "1:86320118727:web:c87c85c935829e7e0f37e2",
  measurementId: "G-5HCL8BWX20"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);