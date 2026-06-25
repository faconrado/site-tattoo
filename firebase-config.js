import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7FQa5eZ_Sd-e1-OI_XYrs-35HmdmWtzs",
  authDomain: "alessandromouratattoo-3ee10.firebaseapp.com",
  projectId: "alessandromouratattoo-3ee10",
  storageBucket: "alessandromouratattoo-3ee10.firebasestorage.app",
  messagingSenderId: "78017745907",
  appId: "1:78017745907:web:d36eaa408736b3f3abb886"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_USERNAME = "alessandro";
const ADMIN_EMAIL = "f.conrado88@gmail.com";
const ADMIN_UID = "QSkEG8dzpkZc9pagSqrGLeCzsJl1";

export {
  auth,
  db,
  storage,
  ADMIN_USERNAME,
  ADMIN_EMAIL,
  ADMIN_UID
};