// Navigation active state
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
  });
});

// Chat Send & Bot Reply Logic
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");

function sendMessage() {
  const message = chatInput.value.trim();
  if (message === "") return;

  // 1. User ka message add karo
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";

  // 2. AI ka automatic reply simulate karo (1 second baad)
  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.textContent = "Hello! I am Zenvyra AI. How can I assist you with your project today?";
    chatMessages.appendChild(aiMsg);
  }, 1000);
}

sendChat.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
