// import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSfeyBdBnx1723zeacHi8POxnVgyzsdfgerUeRX_0PvYbV-o",
    authDomain: "healthcord-594wd3.firebaseapp.com",
    projectId: "healthcord-59d4d3",
    storageBucket: "healthcord-594d3.firebasestorage.app",
    messagingSenderId: "8944886353252667",
    appId: "1:89448865dsf252667:web:0b035d396524sd00a1fb85abde"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Sign up new users
// Sign Up Function
// Sign Up Function
function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User signed up:", user);
            // Redirect to chat page
            window.location.href = "chat.html"; // Change to your chat page URL
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing up:", errorCode, errorMessage);
        });
}

// Sign In Function
function signin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User signed in:", user);
            // Redirect to chat page
            window.location.href = "chat.html"; // Change to your chat page URL
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing in:", errorCode, errorMessage);
        });
}
// Sign out users
// Show the chat section

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html"; // Redirect to signup page
    }).catch(error => {
        console.error("Logout error:", error);
    });
}

// Load chat history for the logged-in user
function loadHistory() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        db.collection("users").doc(userId).collection("history").get().then(querySnapshot => {
            const historyContainer = document.getElementById("historyContainer");
            historyContainer.innerHTML = ""; // Clear previous history
            querySnapshot.forEach(doc => {
                const message = doc.data().message;
                const historyItem = document.createElement("div");
                historyItem.textContent = message;
                historyContainer.appendChild(historyItem);
            });
        }).catch(error => {
            console.error("Error loading history:", error);
        });
    }
}

// Fetch history when the sidebar is opened
document.querySelector(".sidebar-toggle").addEventListener("click", loadHistory);

// Send query function
async function sendQuery(event) {
    event.preventDefault();
    const query = document.getElementById("userInput").value;
    appendMessage("You", "right-msg", query);
    document.getElementById("userInput").value = "";

    try {
        const res = await fetch('https:127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: query })
        });
        const data = await res.json();
        appendMessage("BOT", "left-msg", data.response);
    } catch (error) {
        console.error("Error:", error);
        appendMessage("BOT", "left-msg", "Unable to fetch response.");
    }
}

// Append message to chat
function appendMessage(name, side, text) {
    const msgHTML = `
            <div class="msg ${side}">
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${name}</div>
                        <div class="msg-text">${text}</div>
                    </div>
                </div>
            </div>`;
    document.getElementById("chatContainer").insertAdjacentHTML("beforeend", msgHTML);
    document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
}
