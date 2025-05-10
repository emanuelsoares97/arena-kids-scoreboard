// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCf6p4CWKWMVhGqtvgOQVxnItDCfhvv8n8",
  authDomain: "arenakidsscore.firebaseapp.com",
  databaseURL: "https://arenakidsscore-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "arenakidsscore",
  storageBucket: "arenakidsscore.firebasestorage.app",
  messagingSenderId: "977543352592",
  appId: "1:977543352592:web:bfb90dbe31f09ff41fd595"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue };
