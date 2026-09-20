// Navigation Elements
const navItems = document.querySelectorAll(".nav-item");
const pages = {
  chat: document.getElementById("chatPage"),
  image: document.getElementById("imagePage"),
  video: document.getElementById("videoPage")
};

function switchPage(target) {
  // Sabhi sections ko forcibly hide karo
  Object.values(pages).forEach((page) => {
    if (page) {
      page.style.setProperty("display", "none", "important");
      page.classList.remove("active");
    }
  });

  // Target section ko forcibly show karo
  if (pages[target]) {
    pages[target].style.setProperty("display", "block", "important");
    pages[target].classList.add("active");
  }
}

// Nav clicks
navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const target = item.getAttribute("data-page");

    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    switchPage(target);
  });
});

// Pehli baar khulne par Chat dikhao
switchPage("chat");

// ================= CHAT LOGIC =================
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");
const newChatBtn = document.getElementById("newChatBtn");

function sendMessage() {
  if (!chatInput || !chatMessages) return;
  const message = chatInput.value.trim();
  if (message === "") return;

  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";

  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.textContent = "Hello! Main Zenvyra AI hoon. Aapki kya madad kar sakta hoon?";
    chatMessages.appendChild(aiMsg);
  }, 1000);
}

if (sendChat && chatInput) {
  sendChat.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

if (newChatBtn && chatMessages) {
  newChatBtn.addEventListener("click", () => {
    chatMessages.innerHTML = `
      <div class="welcome-box">
        <h3>✦ Welcome to Zenvyra AI</h3>
        <p>Your intelligent assistant is ready. Type in English or Hindi, or use the voice button below.</p>
      </div>
    `;
  });
}

// ================= VOICE LOGIC =================
const voiceBtn = document.getElementById("voiceBtn");
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      try {
        recognition.start();
        voiceBtn.textContent = "🔴";
      } catch (err) {
        recognition.stop();
        voiceBtn.textContent = "🎙️";
      }
    });

    recognition.onresult = (e) => {
      if (chatInput) chatInput.value = e.results[0][0].transcript;
      voiceBtn.textContent = "🎙️";
    };

    recognition.onend = () => {
      voiceBtn.textContent = "🎙️";
    };
  }
}

}
// ================= IMAGE GENERATOR LOGIC =================
const generateImageBtn = document.getElementById("generateImageBtn");
const imagePrompt = document.getElementById("imagePrompt");
const imageUpload = document.getElementById("imageUpload");
const imageResult = document.getElementById("imageResult");

if (generateImageBtn) {
  generateImageBtn.addEventListener("click", () => {
    const promptText = imagePrompt ? imagePrompt.value.trim() : "";

    if (!promptText && (!imageUpload || !imageUpload.files[0])) {
      alert("Please enter an image prompt or upload a reference image!");
      return;
    }

    let seconds = 0;
    const startTime = Date.now();

    imageResult.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="color: var(--accent); font-weight: 500;">✦ Generating your AI artwork...</span>
        <span id="imageTimer" style="color: var(--muted); font-size: 13px;">Time elapsed: 0s</span>
      </div>
    `;

    const timerInterval = setInterval(() => {
      seconds++;
      const timerElement = document.getElementById("imageTimer");
      if (timerElement) {
        timerElement.textContent = `Time elapsed: ${seconds}s`;
      }
    }, 1000);

    const query = encodeURIComponent(promptText || "futuristic AI artwork");
    const seed = Math.floor(Math.random() * 1000000);
    const finalUrl = "https://image.pollinations.ai/prompt/" + query + "?width=800&height=800&nologo=true&seed=" + seed;

    const img = document.createElement("img");
    img.src = finalUrl;
    img.alt = "Generated Artwork";
    img.style.width = "100%";
    img.style.maxWidth = "420px";
    img.style.borderRadius = "12px";
    img.style.marginTop = "12px";

    img.onload = () => {
      clearInterval(timerInterval);
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      imageResult.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <span style="color: #4ade80; font-size: 13px; margin-bottom: 6px;">✓ Generated in ${totalTime}s</span>
        </div>
      `;
      imageResult.firstElementChild.appendChild(img);
    };

    img.onerror = () => {
      clearInterval(timerInterval);
      imageResult.innerHTML = `<span style="color: #ef4444;">Failed to generate image. Please try again.</span>`;
    };
  });
}

