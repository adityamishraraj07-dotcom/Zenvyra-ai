// Navigation & Page Switching Logic
const navItems = document.querySelectorAll(".nav-item");
const pageSections = {
  chat: document.getElementById("chatPage"),
  image: document.getElementById("imagePage"),
  video: document.getElementById("heroPage"), // abhi ke liye hero/tools section
};

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const targetPage = item.getAttribute("data-page");

    // Nav active styling
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    // Hide all sections
    Object.values(pageSections).forEach((section) => {
      if (section) section.classList.remove("active");
    });

    // Show selected section
    if (pageSections[targetPage]) {
      pageSections[targetPage].classList.add("active");
    }
  });
});

// Chat Send & Bot Reply Logic
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");

function sendMessage() {
  if (!chatInput || !chatMessages) return;
  const message = chatInput.value.trim();
  if (message === "") return;

  // 1. User ka message add karo
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";

  // 2. AI ka automatic reply simulate karo
  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.textContent = "Hello! I am Zenvyra AI. How can I assist you with your project today?";
    chatMessages.appendChild(aiMsg);
  }, 1000);
}

if (sendChat && chatInput) {
  sendChat.addEventListener("click", sendMessage);

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
}
