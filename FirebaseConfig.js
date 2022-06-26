import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { getDatabase } from "firebase/database"
import { getAuth } from 'firebase/auth';

// need to run: npm install --save firebase
// We will use the JS SDK with React Native

var firebaseConfig = {
  apiKey: "AIzaSyDS1S1_pv0fTEQMMyFMzOGzKjyi8BzQ3js",
  authDomain: "final-project-rn-db3bd.firebaseapp.com",
  projectId: "final-project-rn-db3bd",
  storageBucket: "final-project-rn-db3bd.appspot.com",
  messagingSenderId: "857745015667",
  appId: "1:857745015667:web:74f2918633de9b6a507b06",
  measurementId: "G-3JY1409CWP"
};

var app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const db = getDatabase(app);
export const auth = getAuth(app);