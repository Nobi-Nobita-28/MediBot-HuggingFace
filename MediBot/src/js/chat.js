const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// Firebase Initialization
const user = firebase.auth().currentUser;
const db = firebase.firestore();

// Send Message and Save to Firebase
async function sendQuery(event) {
    event.preventDefault();
    const query = document.getElementById("userInput").value;
    appendMessage("You", "right-msg", query);

    // Save User Message to Firestore
    if (user) {
        await db.collection("chat_history").add({
            uid: user.uid,
            message: query,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    try {
        const res = await fetch('https://YOUR_SERVER_URL.ngrok-free.app/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: query })
        });
        const data = await res.json();
        appendMessage("BOT", "left-msg", data.response);

        // Save Bot Response to Firestore
        if (user) {
            await db.collection("chat_history").add({
                uid: user.uid,
                message: data.response,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error:", error);
        appendMessage("BOT", "left-msg", "Error: Unable to fetch response from the model.");
    }

    document.getElementById("userInput").value = ""; // Clear input field
}

// Append Messages to Chat Window
function appendMessage(name, side, text) {
    const msgHTML = `
                <div class="msg ${side}">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${name}</div>
                            <div class="msg-info-time">${new Date().toLocaleTimeString()}</div>
                        </div>
                        <div class="msg-text">${text}</div>
                    </div>
                </div>`;
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.insertAdjacentHTML("beforeend", msgHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show Chat History from Firestore
async function showHistory() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.innerHTML = ""; // Clear chat window

    const history = await db.collection("chat_history")
        .where("uid", "==", user.uid)
        .orderBy("timestamp", "asc")
        .get();

    history.forEach(doc => {
        const data = doc.data();
        const side = data.uid === user.uid ? "right-msg" : "left-msg";
        appendMessage(side === "right-msg" ? "You" : "BOT", side, data.message);
    });
}

// Logout Function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html"; // Redirect to login page
    }).catch(error => {
        console.error("Logout Error:", error);
    });
}