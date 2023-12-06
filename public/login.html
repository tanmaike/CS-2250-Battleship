// Firebase App (the core Firebase SDK) is always required and must be listed first
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

// Add the Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIm9eiwxJwdJKgOsjR8rJg1iQCUGsvkl0",
  authDomain: "database-feb54.firebaseapp.com",
  projectId: "database-feb54",
  storageBucket: "database-feb54.appspot.com",
  messagingSenderId: "767966207802",
  appId: "1:767966207802:web:4``aa928a7940d4794223a03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Register function
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const fullName = document.getElementById('full_name').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    await set(ref(database, 'users/' + userId), {
      fullName: fullName
    });
    alert('User registered and data saved!');
  } catch (error) {
    alert(error.message);
  }
}

// Login function
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('User logged in!');
  } catch (error) {
    alert(error.message);
  }
}

// Linking functions to buttons
document.getElementById('login_button').addEventListener('click', login);
document.getElementById('register_button').addEventListener('click', register);
