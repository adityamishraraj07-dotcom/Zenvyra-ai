// ================= ZENVYRA AI COMPLETE APPLICATION LOGIC =================

document.addEventListener("DOMContentLoaded", () => {
  // 1. NAVIGATION TAB SWITCHER
  const navBtns = document.querySelectorAll(".nav-btn");
  const contentPages = document.querySelectorAll(".content-page");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      navBtns.forEach((b) => b.classList.remove("active"));
      // Hide all pages
      contentPages.forEach((page) => (page.style.display = "none"));

      // Set active button
      btn.classList.add("active");

      // Show selected page
      const targetPageId = btn.getAttribute("data-page") + "Page";
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.style.display = "flex";
      }
    });
  });

  // 2. AI CHAT SYSTEM
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChatBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const chatMessages = document.getElementById("chatMessages");

  function appendMessage(sender, text) {
    const msgEl = document.createElement("div");
    msgEl.style.padding = "10px 14px";
    msgEl.style.borderRadius = "12px";
    msgEl.style.fontSize = "14px";
    msgEl.style.lineHeight = "1.4";
    msgEl.style.wordBreak = "break-word";

    if (sender === "user") {
      msgEl.style.background = "#1e293b";
      msgEl.style.color = "#ffffff";
      msgEl.style.alignSelf = "flex-end";
      msgEl.style.maxWidth = "85%";
      msgEl.innerHTML = `<strong>You:</strong> ${text}`;
    } else {
      msgEl.style.background = "rgba(99, 102, 241, 0.15)";
      msgEl.style.border = "1px solid rgba(99, 102, 241, 0.3)";
      msgEl.style.color = "#e2e8f0";
      msgEl.style.alignSelf = "flex-start";
      msgEl.style.maxWidth = "90%";
      msgEl.innerHTML = `<strong>Zenvyra AI:</strong> ${text}`;
    }

    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function handleChat() {
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage("user", query);
    chatInput.value = "";
    sendChatBtn.disabled = true;
    sendChatBtn.innerText = "Thinking...";

    try {
      // Free open AI inference endpoint
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?model=openai`);
      const data = await response.text();
      appendMessage("ai", data || "Zenvyra AI response could not be generated.");
    } catch (err) {
      appendMessage("ai", "Sorry, an error occurred while connecting to Zenvyra AI server.");
    } finally {
      sendChatBtn.disabled = false;
      sendChatBtn.innerText = "Send →";
    }
  }

  if (sendChatBtn) {
    sendChatBtn.addEventListener("click", handleChat);
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
      }
    });
  }

  // 3. VOICE RECOGNITION (HINDI / ENGLISH)
  if (voiceBtn && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Supports Hindi & English
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", () => {
      try {
        recognition.start();
        voiceBtn.innerText = "Listening...";
      } catch (e) {
        recognition.stop();
        voiceBtn.innerText = "🎙️ Voice";
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      voiceBtn.innerText = "🎙️ Voice";
      handleChat();
    };

    recognition.onerror = () => {
      voiceBtn.innerText = "🎙️ Voice";
    };

    recognition.onend = () => {
      voiceBtn.innerText = "🎙️ Voice";
    };
  }

  // 4. IMAGE GENERATOR (POLLINATIONS FLUX STUDIO)
  const imagePrompt = document.getElementById("imagePrompt");
  const aspectRatio = document.getElementById("aspectRatio");
  const generateImageBtn = document.getElementById("generateImageBtn");
  const imageResult = document.getElementById("imageResult");

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", async () => {
      const prompt = imagePrompt.value.trim();
      if (!prompt) {
        alert("Please describe the image first!");
        return;
      }

      generateImageBtn.disabled = true;
      generateImageBtn.innerText = "Creating Artwork...";
      imageResult.innerHTML = `<p style="color: #94a3b8; font-size: 14px;">🎨 Generating your high-resolution image, please wait...</p>`;

      let width = 1024;
      let height = 1024;
      const ratio = aspectRatio ? aspectRatio.value : "1:1";

      if (ratio === "16:9") {
        width = 1280;
        height = 720;
      } else if (ratio === "9:16") {
        width = 720;
        height = 1280;
      }

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

      const img = new Image();
      img.src = imageUrl;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "16px";
      img.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
      img.style.marginTop = "10px";

      img.onload = () => {
        imageResult.innerHTML = "";
        imageResult.appendChild(img);

        // Download Action Button
        const downloadBtn = document.createElement("button");
        downloadBtn.innerText = "⬇️ Download Image";
        downloadBtn.className = "btn-secondary full-width";
        downloadBtn.style.marginTop = "10px";
        downloadBtn.onclick = async () => {
          try {
            const resp = await fetch(imageUrl);
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `zenvyra-ai-${seed}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            window.open(imageUrl, "_blank");
          }
        };

        imageResult.appendChild(downloadBtn);
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate with AI →";
      };

      img.onerror = () => {
        imageResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Failed to generate image. Please try another prompt.</p>`;
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate with AI →";
      };
    });
  }

  // 5. VIDEO GENERATOR SYSTEM
  const videoPrompt = document.getElementById("videoPrompt");
  const generateVideoBtn = document.getElementById("generateVideoBtn");
  const videoResult = document.getElementById("videoResult");

  if (generateVideoBtn) {
    generateVideoBtn.addEventListener("click", () => {
      const prompt = videoPrompt.value.trim();
      if (!prompt) {
        alert("Please enter a scene description or script!");
        return;
      }

      generateVideoBtn.disabled = true;
      generateVideoBtn.innerText = "Rendering Scene...";
      videoResult.innerHTML = `
        <div style="background: #111827; padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
          <p style="color: #6366f1; font-weight: 600;">🎬 Video Studio Pipeline Initialized</p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Prompt: "${prompt}"</p>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 10px;">Rendering high-motion clip... please wait.</p>
        </div>
      `;

      setTimeout(() => {
        generateVideoBtn.disabled = false;
        generateVideoBtn.innerText = "Generate Video →";
      }, 4000);
    });
  }
});
              
