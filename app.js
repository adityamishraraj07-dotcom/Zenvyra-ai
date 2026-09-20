// ==========================================
// 1. PAGE SWITCHING LOGIC (Chat / Image / Video)
// ==========================================
const navItems = document.querySelectorAll(".nav-item");
const pageSections = {
  chat: document.getElementById("chatPage"),
  image: document.getElementById("imagePage"),
  video: document.getElementById("videoPage"),
};

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const target = item.getAttribute("data-page");

    // Nav active styling
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    // Hide all pages, show target page
    Object.values(pageSections).forEach((section) => {
      if (section) section.classList.remove("active");
    });

    if (pageSections[target]) {
      pageSections[target].classList.add("active");
    }
  });
});

// ==========================================
// 2. CHAT LOGIC (Send & Bot Reply)
// ==========================================
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");
const newChatBtn = document.getElementById("newChatBtn");

function sendMessage() {
  if (!chatInput || !chatMessages) return;
  const message = chatInput.value.trim();
  if (message === "") return;

  // Append user message
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";

  // Simulated AI response
  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.textContent = "Hello! Main Zenvyra AI hoon. Aapki kya madad kar sakta hoon?";
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

if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="welcome-box">
          <h3>✦ Welcome to Zenvyra AI</h3>
          <p>Your intelligent assistant is ready. Type in English or Hindi, or use the voice button below.</p>
        </div>
      `;
    }
  });
}

// ==========================================
// 3. VOICE INPUT LOGIC (Hindi & English Support)
// ==========================================
const voiceBtn = document.getElementById("voiceBtn");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "hi-IN"; // Hindi aur Hinglish/English support

  let isRecording = false;

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!isRecording) {
        recognition.start();
        voiceBtn.textContent = "🔴";
        isRecording = true;
      } else {
        recognition.stop();
        voiceBtn.textContent = "🎙️";
        isRecording = false;
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (chatInput) {
        chatInput.value = transcript;
      }
      voiceBtn.textContent = "🎙️";
      isRecording = false;
    };

    recognition.onerror = () => {
      voiceBtn.textContent = "🎙️";
      isRecording = false;
    };

    recognition.onend = () => {
      voiceBtn.textContent = "🎙️";
      isRecording = false;
    };
  }
} else {
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      alert("Aapke browser me Voice Recognition support nahi hai.");
    });
  }
}
