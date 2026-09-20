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

// ================= IMAGE GENERATOR LOGIC (Dynamic Aspect Ratio + Prompt Accurate) =================
const generateImageBtn = document.getElementById("generateImageBtn");
const imagePrompt = document.getElementById("imagePrompt");
const imageUpload = document.getElementById("imageUpload");
const imageResult = document.getElementById("imageResult");

if (generateImageBtn) {
  generateImageBtn.addEventListener("click", () => {
    const rawPrompt = imagePrompt ? imagePrompt.value.trim() : "";

    if (!rawPrompt && (!imageUpload || !imageUpload.files[0])) {
      alert("Please enter an image description prompt!");
      return;
    }

    let elapsed = 0;
    const startTime = Date.now();

    imageResult.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <span style="color:var(--accent); font-weight:600;">✦ Rendering your AI visual...</span>
        <span id="liveTimer" style="color:var(--muted); font-size:13px;">Time elapsed: 0s</span>
      </div>
    `;

    const timer = setInterval(() => {
      elapsed++;
      const timerEl = document.getElementById("liveTimer");
      if (timerEl) timerEl.textContent = `Time elapsed: ${elapsed}s`;
    }, 1000);

    // Check user intent for aspect ratio
    const lowerPrompt = rawPrompt.toLowerCase();
    let imgWidth = 1024;
    let imgHeight = 1024;

    if (lowerPrompt.includes("landscape") || lowerPrompt.includes("wallpaper") || lowerPrompt.includes("wide") || lowerPrompt.includes("16:9")) {
      imgWidth = 1280;
      imgHeight = 720;
    } else if (lowerPrompt.includes("portrait") || lowerPrompt.includes("story") || lowerPrompt.includes("vertical") || lowerPrompt.includes("9:16")) {
      imgWidth = 768;
      imgHeight = 1152;
    }

    // General high-quality enhancers (Bina kisi hardcoded portrait tag ke)
    const qualityBoost = "masterpiece, 8k resolution, highly detailed, sharp focus, professional lighting, photorealistic";
    const negativeFilter = "blur, hazy, soft focus, deformed, bad anatomy, low quality, artifacts, distorted";
    
    const finalPromptText = `${rawPrompt}, ${qualityBoost}, no ${negativeFilter}`;
    const query = encodeURIComponent(finalPromptText);
    const seed = Math.floor(Math.random() * 90000000) + 1000000;

    const finalUrl = `https://image.pollinations.ai/prompt/${query}?width=${imgWidth}&height=${imgHeight}&model=flux&nologo=1&seed=${seed}`;

    // Clean frame jo watermark strip ko cut karta hai
    const frame = document.createElement("div");
    frame.style.width = "100%";
    frame.style.maxWidth = "460px";
    frame.style.aspectRatio = `${imgWidth} / ${imgHeight * 0.94}`;
    frame.style.overflow = "hidden";
    frame.style.borderRadius = "14px";
    frame.style.marginTop = "14px";
    frame.style.boxShadow = "0 12px 36px rgba(0,0,0,0.65)";
    frame.style.background = "#0f172a";

    const img = document.createElement("img");
    img.src = finalUrl;
    img.alt = "Generated Artwork";
    img.style.width = "100%";
    img.style.height = "106.5%";
    img.style.objectFit = "cover";
    img.style.objectPosition = "top";
    img.style.display = "block";

    frame.appendChild(img);

    // Download Button
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "⬇ Download Image";
    downloadBtn.style.marginTop = "14px";
    downloadBtn.style.padding = "10px 22px";
    downloadBtn.style.borderRadius = "8px";
    downloadBtn.style.border = "none";
    downloadBtn.style.background = "linear-gradient(135deg, #6366f1, #a855f7)";
    downloadBtn.style.color = "#ffffff";
    downloadBtn.style.fontSize = "14px";
    downloadBtn.style.fontWeight = "600";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";

    downloadBtn.onclick = async () => {
      downloadBtn.textContent = "⏳ Downloading...";
      try {
        const res = await fetch(finalUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `zenvyra_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        downloadBtn.textContent = "✓ Downloaded!";
        setTimeout(() => (downloadBtn.textContent = "⬇ Download Image"), 2000);
      } catch (err) {
        window.open(finalUrl, "_blank");
        downloadBtn.textContent = "⬇ Download Image";
      }
    };

    img.onload = () => {
      clearInterval(timer);
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      imageResult.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width: 100%;">
          <span style="color:#4ade80; font-size:13px; font-weight:600; margin-bottom:8px;">✓ Rendered in ${totalTime}s (${imgWidth}x${imgHeight})</span>
        </div>
      `;
      imageResult.firstElementChild.appendChild(frame);
      imageResult.firstElementChild.appendChild(downloadBtn);
    };

    img.onerror = () => {
      clearInterval(timer);
      imageResult.innerHTML = `<span style="color:#ef4444;">Generation failed. Please try again.</span>`;
    };
  });
      }
