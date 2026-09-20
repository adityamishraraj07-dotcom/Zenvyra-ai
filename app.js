// ================= PAGE SWITCHING =================
const navItems = document.querySelectorAll(".nav-item");
const pages = {
  chat: document.getElementById("chatPage"),
  image: document.getElementById("imagePage"),
  video: document.getElementById("videoPage")
};

function switchPage(target) {
  Object.values(pages).forEach((page) => {
    if (page) {
      page.style.setProperty("display", "none", "important");
      page.classList.remove("active");
    }
  });

  if (pages[target]) {
    pages[target].style.setProperty("display", "block", "important");
    pages[target].classList.add("active");
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const target = item.getAttribute("data-page");
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
    switchPage(target);
  });
});

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
    aiMsg.textContent = "Hello! I am Zenvyra AI. How can I assist you today?";
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

// ================= IMAGE GENERATOR LOGIC (No Watermark + Live Timer) =================
const generateImageBtn = document.getElementById("generateImageBtn");
const imagePrompt = document.getElementById("imagePrompt");
const imageUpload = document.getElementById("imageUpload");
const imageResult = document.getElementById("imageResult");

if (generateImageBtn) {
  generateImageBtn.addEventListener("click", () => {
    const promptText = imagePrompt ? imagePrompt.value.trim() : "";

    if (!promptText && (!imageUpload || !imageUpload.files[0])) {
      alert("Please enter an image description prompt!");
      return;
    }

    let elapsed = 0;
    const startTime = Date.now();

    imageResult.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <span style="color:var(--accent); font-weight:600;">✦ Generating your AI artwork...</span>
        <span id="liveTimer" style="color:var(--muted); font-size:13px;">Time elapsed: 0s</span>
      </div>
    `;

    const timer = setInterval(() => {
      elapsed++;
      const timerEl = document.getElementById("liveTimer");
      if (timerEl) timerEl.textContent = `Time elapsed: ${elapsed}s`;
    }, 1000);

    const query = encodeURIComponent(promptText || "cinematic masterpiece 8k");
    const seed = Math.floor(Math.random() * 1000000);
    const finalUrl = "https://image.pollinations.ai/prompt/" + query + "?width=800&height=800&nologo=true&nofeed=true&enhance=false&seed=" + seed;

    // Outer wrapper jo bottom watermark ko frame se mask out karega
    const imgWrapper = document.createElement("div");
    imgWrapper.style.width = "100%";
    imgWrapper.style.maxWidth = "420px";
    imgWrapper.style.height = "392px";
    imgWrapper.style.overflow = "hidden";
    imgWrapper.style.borderRadius = "14px";
    imgWrapper.style.marginTop = "12px";
    imgWrapper.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";

    const img = document.createElement("img");
    img.src = finalUrl;
    img.alt = "Generated Artwork";
    img.style.width = "100%";
    img.style.height = "420px";
    img.style.objectFit = "cover";
    img.style.display = "block";

    imgWrapper.appendChild(img);

    img.onload = () => {
      clearInterval(timer);
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      imageResult.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <span style="color:#4ade80; font-size:13px; font-weight:600; margin-bottom:8px;">✓ Generated successfully in ${totalTime}s</span>
        </div>
      `;
      imageResult.firstElementChild.appendChild(imgWrapper);
    };

    img.onerror = () => {
      clearInterval(timer);
      imageResult.innerHTML = `<span style="color:#ef4444;">Generation failed. Please try again.</span>`;
    };
  });
        }
      
