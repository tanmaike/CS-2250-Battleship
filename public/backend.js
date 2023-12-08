
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, update, query, orderByChild, equalTo, get, limitToLast } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";


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
    console.log('Register function called');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full_name').value;

    console.log('Email:', email);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created with UID:', userCredential.user.uid);

        const userId = userCredential.user.uid;
        await set(ref(database, 'users/' + userId), {
            fullName: fullName,
            email: email
        });
        console.log('go to thing');
        localStorage.setItem('userEmail', email);

        location.href = 'game.html';
    } catch (error) {
        console.error('Error in register function:', error.message);
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


async function addWin() {
    const usersRef = ref(database, 'users');
    const userEmail = localStorage.getItem('userEmail');
    try {
        const querySnapshot = await query(usersRef, orderByChild('email'), equalTo(userEmail));
        const userSnapshot = await get(querySnapshot);

        if (userSnapshot.exists()) {
            userSnapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                let wins = userData.wins || 0;

                wins++;

                const userRef = childSnapshot.ref;
                update(userRef, { wins: wins });
                alert('Win count updated!');
            });
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

async function displayTop5() {
    try {
        const topUsers = await getTop5();
        const leaderboardElement = document.getElementById('leaderboard');

        if (topUsers.length === 0) {
            leaderboardElement.innerHTML = '<p>No users found.</p>';
            return;
        }

        const list = document.createElement('ol');
        for (const user of topUsers) {
            const listItem = document.createElement('li');
            listItem.textContent = `${user.fullName} - Wins: ${user.wins}`;
            list.appendChild(listItem);
        }

        leaderboardElement.appendChild(list);
    } catch (error) {
        console.error('Error fetching top 5 users:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayTop5);



async function getTop5() {
    const usersRef = ref(database, 'users');
    console.log("usersArray");

    try {
        const topUsersQuery = query(usersRef, orderByChild('wins'), limitToLast(5));

        const snapshot = await get(topUsersQuery);
        console.log("usersArray");

        if (snapshot.exists()) {
            const usersArray = [];
            snapshot.forEach((childSnapshot) => {
                usersArray.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val(),
                });
            });
            usersArray.reverse();

            console.log(usersArray);
            return usersArray;
        } else {
            console.log('No users found');
            return [];
        }
    } catch (error) {
        console.error('Error fetching top 5 users:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('add_win_button').addEventListener('click', addWin);
    document.getElementById('getTop5Button').addEventListener('click', getTop5);
    document.getElementById('login_button').addEventListener('click', login);

});
document.addEventListener('DOMContentLoaded', displayTop5);


export { register, login, addWin, getUserWins, getTop5 };
