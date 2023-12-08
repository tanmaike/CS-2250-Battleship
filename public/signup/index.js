import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIm9eiwxJwdJKgOsjR8rJg1iQCUGsvkl0",
  authDomain: "database-feb54.firebaseapp.com",
  projectId: "database-feb54",
  storageBucket: "database-feb54.appspot.com",
  messagingSenderId: "767966207802",
  appId: "1:767966207802:web:4``aa928a7940d4794223a03"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

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

async function addWin(userId) {
  const userRef = ref(database, 'users/' + userId);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      let wins = userData.wins || 0;

      wins++;

      await update(userRef, { wins: wins });
      alert('Win count updated!');
    } else {
      alert('User not found');
    }
  } catch (error) {
    alert(error.message);
  }
}


async function getUserWins(userId) {
  const userRef = ref(database, 'users/' + userId);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();

      return userData.wins || 0;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    throw error;
  }
}

document.getElementById('login_button').addEventListener('click', login);
document.getElementById('register_button').addEventListener('click', register);