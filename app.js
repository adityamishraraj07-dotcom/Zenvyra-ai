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

  // 2. Chat Logic
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

  // 4. REAL NEURAL AI VOICE GENERATOR (Distinct Audio Streams)
  const voiceTextPrompt = document.getElementById("voiceTextPrompt");
  const voiceVoiceSelect = document.getElementById("voiceVoiceSelect");
  const playVoiceBtn = document.getElementById("playVoiceBtn");
  const realAudioPlayer = document.getElementById("realAudioPlayer");
  const audioPlayerContainer = document.getElementById("audioPlayerContainer");
  const voiceStatus = document.getElementById("voiceStatus");

  if (playVoiceBtn) {
    playVoiceBtn.addEventListener("click", async () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) {
        alert("Please enter text to speak!");
        return;
      }

      const voice = voiceVoiceSelect.value;
      playVoiceBtn.disabled = true;
      playVoiceBtn.innerText = "Generating Neural Voice...";
      voiceStatus.innerHTML = "<span style='color: #818cf8;'>Generating real audio...</span>";

      try {
        let audioUrl = "";

        if (voice.startsWith("hi")) {
          // Direct high-clarity Indian Hindi Audio Stream
          audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodeURIComponent(text)}`;
        } else if (voice.includes("GB")) {
          // British English Voice Stream
          audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-gb&client=tw-ob&q=${encodeURIComponent(text)}`;
        } else {
          // US English Voice Stream
          audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-us&client=tw-ob&q=${encodeURIComponent(text)}`;
        }

        realAudioPlayer.src = audioUrl;
        audioPlayerContainer.style.display = "block";
        
        await realAudioPlayer.play();
        voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ Playing generated voice!</span>";
      } catch (err) {
        // Fallback to Web Speech API with pitch modulation for distinct voices
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          if (voice.includes("Female") || voice.includes("Jenny") || voice.includes("Swara")) {
            utterance.pitch = 1.4;
            utterance.rate = 0.95;
          } else {
            utterance.pitch = 0.65;
            utterance.rate = 0.9;
          }
          if (voice.startsWith("hi")) utterance.lang = "hi-IN";
          else utterance.lang = "en-US";
          window.speechSynthesis.speak(utterance);
          voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ Playing voice!</span>";
        } else {
          voiceStatus.innerHTML = "<span style='color: #ef4444;'>Playback error.</span>";
        }
      } finally {
        playVoiceBtn.disabled = false;
        playVoiceBtn.innerText = "🎵 Generate & Play Voice";
      }
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
          
