document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Switcher
  const navBtns = document.querySelectorAll(".nav-btn");
  const contentPages = document.querySelectorAll(".content-page");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      contentPages.forEach((page) => (page.style.display = "none"));

      btn.classList.add("active");
      const targetPageId = btn.getAttribute("data-page") + "Page";
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.style.display = "flex";
      }
    });
  });

  // 2. Chat Logic with Speak Feature
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChatBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const chatMessages = document.getElementById("chatMessages");

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

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
      msgEl.innerHTML = `<strong>Zenvyra AI:</strong> ${text} <br/><button class="listen-btn" style="margin-top: 6px; padding: 4px 10px; font-size: 11px; background: rgba(255,255,255,0.12); border: none; border-radius: 6px; color: #fff; cursor: pointer;">🔊 Listen</button>`;
      
      const listenBtn = msgEl.querySelector(".listen-btn");
      if (listenBtn) {
        listenBtn.onclick = () => speakText(text);
      }
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
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?model=openai`);
      const data = await response.text();
      appendMessage("ai", data || "Zenvyra AI response could not be generated.");
    } catch (err) {
      appendMessage("ai", "Sorry, an error occurred while connecting to server.");
    } finally {
      sendChatBtn.disabled = false;
      sendChatBtn.innerText = "Send →";
    }
  }

  if (sendChatBtn) sendChatBtn.addEventListener("click", handleChat);
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
      }
    });
  }

  // 3. Voice Input (Speech-to-Text)
  if (voiceBtn && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";

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
      chatInput.value = event.results[0][0].transcript;
      voiceBtn.innerText = "🎙️ Voice";
      handleChat();
    };

    recognition.onerror = () => { voiceBtn.innerText = "🎙️ Voice"; };
    recognition.onend = () => { voiceBtn.innerText = "🎙️ Voice"; };
  }

  // 4. MULTI-STYLE AI VOICE GENERATOR (ADVANCED PERSONAS)
  const voiceTextPrompt = document.getElementById("voiceTextPrompt");
  const voiceVoiceSelect = document.getElementById("voiceVoiceSelect");
  const voiceSpeed = document.getElementById("voiceSpeed");
  const playVoiceBtn = document.getElementById("playVoiceBtn");
  const stopVoiceBtn = document.getElementById("stopVoiceBtn");
  const voiceStatus = document.getElementById("voiceStatus");

  let availableVoices = [];
  function populateVoices() {
    if ("speechSynthesis" in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }
  }
  populateVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  if (playVoiceBtn) {
    playVoiceBtn.addEventListener("click", () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) {
        alert("Please enter script or text to speak!");
        return;
      }

      if (!("speechSynthesis" in window)) {
        voiceStatus.innerText = "Speech synthesis not supported on this browser.";
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const persona = voiceVoiceSelect.value;
      const speed = parseFloat(voiceSpeed.value) || 1.0;

      utterance.rate = speed;

      // Filter and assign acoustic profiles
      const hindiVoice = availableVoices.find(v => v.lang.includes("hi") || v.lang.includes("HI"));
      const engUsVoice = availableVoices.find(v => v.lang.includes("en-US") || v.lang.includes("en_US"));
      const engUkVoice = availableVoices.find(v => v.lang.includes("en-GB") || v.lang.includes("en_GB"));

      switch (persona) {
        case "hi_female_soft":
          if (hindiVoice) utterance.voice = hindiVoice;
          utterance.lang = "hi-IN";
          utterance.pitch = 1.35;
          break;

        case "hi_male_deep":
          if (hindiVoice) utterance.voice = hindiVoice;
          utterance.lang = "hi-IN";
          utterance.pitch = 0.75;
          break;

        case "hi_male_young":
          if (hindiVoice) utterance.voice = hindiVoice;
          utterance.lang = "hi-IN";
          utterance.pitch = 1.05;
          break;

        case "hi_storyteller":
          if (hindiVoice) utterance.voice = hindiVoice;
          utterance.lang = "hi-IN";
          utterance.pitch = 0.85;
          utterance.rate = speed * 0.9;
          break;

        case "en_female_warm":
          if (engUsVoice) utterance.voice = engUsVoice;
          utterance.lang = "en-US";
          utterance.pitch = 1.25;
          break;

        case "en_male_cinematic":
          if (engUsVoice) utterance.voice = engUsVoice;
          utterance.lang = "en-US";
          utterance.pitch = 0.65;
          break;

        case "en_energetic":
          if (engUsVoice) utterance.voice = engUsVoice;
          utterance.lang = "en-US";
          utterance.pitch = 1.15;
          utterance.rate = speed * 1.15;
          break;

        case "en_uk_premium":
          if (engUkVoice) utterance.voice = engUkVoice;
          else if (engUsVoice) utterance.voice = engUsVoice;
          utterance.lang = "en-GB";
          utterance.pitch = 0.95;
          break;

        default:
          utterance.lang = "en-US";
          utterance.pitch = 1.0;
      }

      utterance.onstart = () => {
        voiceStatus.innerHTML = `🔊 <span style="color: #6366f1; font-weight: 600;">Speaking in selected voice profile...</span>`;
      };

      utterance.onend = () => {
        voiceStatus.innerHTML = `<span style="color: #10b981; font-weight: 600;">✓ Voice generated successfully!</span>`;
      };

      utterance.onerror = () => {
        voiceStatus.innerHTML = `<span style="color: #ef4444;">Could not play audio. Check browser permissions.</span>`;
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", () => {
      window.speechSynthesis.cancel();
      voiceStatus.innerText = "⏹️ Voice stopped.";
    });
  }

  // 5. Image Generator
  const imagePrompt = document.getElementById("imagePrompt");
  const aspectRatio = document.getElementById("aspectRatio");
  const generateImageBtn = document.getElementById("generateImageBtn");
  const imageResult = document.getElementById("imageResult");

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", async () => {
      const prompt = imagePrompt.value.trim();
      if (!prompt) return alert("Please enter an image description!");

      generateImageBtn.disabled = true;
      generateImageBtn.innerText = "Creating Artwork...";
      imageResult.innerHTML = `<p style="color: #94a3b8; font-size: 14px;">🎨 Generating your image, please wait...</p>`;

      let width = 1024, height = 1024;
      const ratio = aspectRatio ? aspectRatio.value : "1:1";
      if (ratio === "16:9") { width = 1280; height = 720; }
      else if (ratio === "9:16") { width = 720; height = 1280; }

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

      const img = new Image();
      img.src = imageUrl;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "16px";
      img.style.marginTop = "10px";

      img.onload = () => {
        imageResult.innerHTML = "";
        imageResult.appendChild(img);
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate with AI →";
      };

      img.onerror = () => {
        imageResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Failed to generate image. Try again.</p>`;
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate with AI →";
      };
    });
  }

  // 6. Video Generator
  const videoPrompt = document.getElementById("videoPrompt");
  const generateVideoBtn = document.getElementById("generateVideoBtn");
  const videoResult = document.getElementById("videoResult");

  if (generateVideoBtn) {
    generateVideoBtn.addEventListener("click", () => {
      const prompt = videoPrompt.value.trim();
      if (!prompt) return alert("Please enter scene description!");

      generateVideoBtn.disabled = true;
      generateVideoBtn.innerText = "Rendering Scene...";
      videoResult.innerHTML = `
        <div style="background: #111827; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px;">
          <p style="color: #6366f1; font-weight: 600;">🎬 Video Studio Initialized</p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Prompt: "${prompt}"</p>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 8px;">Rendering clip... please wait.</p>
        </div>
      `;

      setTimeout(() => {
        generateVideoBtn.disabled = false;
        generateVideoBtn.innerText = "Generate Video →";
      }, 4000);
    });
  }
});
    
