import {getDatabase, set, update, onChildAdded, ref, get, onValue} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import {getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";

const firebaseConfig = {
    apiKey: atob("QUl6YVN5QlVWSVBpLWtkdWNpRjZoMjVBWG9hSlN5VFhSMVdBeXpv"),
    authDomain: atob("bWFzYS1uYXIuZmlyZWJhc2VhcHAuY29t"),
    databaseURL: atob("aHR0cHM6Ly9tYXNhLW5hci1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20="),
    projectId: atob("bWFzYS1uYXI="),
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export {app, database, auth, set, onChildAdded, update, ref, get, onValue, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword}