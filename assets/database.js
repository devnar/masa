// Firebase Config
import { getDatabase, set, ref, get, onValue } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBUVIPi-kduciF6h25AXoaJSyTXR1WAyzo",
    authDomain: "masa-nar.firebaseapp.com",
    databaseURL: "https://masa-nar-default-rtdb.firebaseio.com",
    projectId: "masa-nar",
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
export { app, database, auth,  set, ref, get, onValue, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword  };