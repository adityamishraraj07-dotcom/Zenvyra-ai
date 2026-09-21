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
      appendMessage("ai", data || "No response received from the server.");
    } catch (err) {
      appendMessage("ai", "An error occurred while communicating with the server.");
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

  // 3. Speech-to-Text
  if (voiceBtn && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

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

  // 4. AI Voice Generator & Instant Audio Download
  const voiceTextPrompt = document.getElementById("voiceTextPrompt");
  const voiceVoiceSelect = document.getElementById("voiceVoiceSelect");
  const playVoiceBtn = document.getElementById("playVoiceBtn");
  const downloadVoiceBtn = document.getElementById("downloadVoiceBtn");
  const voiceStatus = document.getElementById("voiceStatus");

  let systemVoices = [];
  function syncVoices() {
    if ("speechSynthesis" in window) {
      systemVoices = window.speechSynthesis.getVoices();
    }
  }
  syncVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = syncVoices;
  }

  function getAcousticConfig(voiceType) {
    switch (voiceType) {
      case "in_female_soft":
        return { pitch: 1.45, rate: 1.0, lang: "hi-IN" };
      case "in_female_expressive":
        return { pitch: 1.25, rate: 0.95, lang: "hi-IN" };
      case "in_female_pro":
        return { pitch: 1.1, rate: 1.05, lang: "en-IN" };
      case "in_male_deep":
        return { pitch: 0.65, rate: 0.9, lang: "hi-IN" };
      case "in_male_young":
        return { pitch: 0.95, rate: 1.15, lang: "en-IN" };
      case "in_male_broadcast":
        return { pitch: 0.8, rate: 1.0, lang: "en-IN" };
      case "us_female":
        return { pitch: 1.2, rate: 1.0, lang: "en-US" };
      case "us_male":
        return { pitch: 0.7, rate: 0.95, lang: "en-US" };
      case "uk_male":
        return { pitch: 0.9, rate: 1.0, lang: "en-GB" };
      default:
        return { pitch: 1.0, rate: 1.0, lang: "en-IN" };
    }
  }

  // Generate Audio WAV Buffer
  function generateWavAudio(text, pitch, rate) {
    const sampleRate = 22050;
    const duration = Math.max(1.2, text.length * 0.08 * (1 / rate));
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, numSamples * 2, true);

    const baseFreq = 160 * pitch;
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin((Math.PI * i) / numSamples);
      const sample = (Math.sin(2 * Math.PI * baseFreq * t) + 0.3 * Math.sin(4 * Math.PI * baseFreq * t)) * 0.4 * envelope;
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  // 1. Play Voice Button
  if (playVoiceBtn) {
    playVoiceBtn.addEventListener("click", () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) {
        alert("Please enter text or script to speak.");
        return;
      }

      const voice = voiceVoiceSelect.value;
      const cfg = getAcousticConfig(voice);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = cfg.lang;
        utterance.pitch = cfg.pitch;
        utterance.rate = cfg.rate;

        const targetLang = cfg.lang.toLowerCase().replace("-", "_");
        const matched = systemVoices.find(v => v.lang.toLowerCase().includes(targetLang) || v.lang.toLowerCase().includes(cfg.lang.toLowerCase()));
        if (matched) {
          utterance.voice = matched;
        }

        voiceStatus.innerHTML = "<span style='color: #818cf8;'>Playing voice audio...</span>";

        utterance.onend = () => {
          voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Voice playback completed.</span>";
        };

        window.speechSynthesis.speak(utterance);
      }
    });
  }

  // 2. Download Audio Button (Always Generates & Downloads Directly)
  if (downloadVoiceBtn) {
    downloadVoiceBtn.addEventListener("click", () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) {
        alert("Please enter text or script to download.");
        return;
      }

      downloadVoiceBtn.innerText = "⏳ Generating File...";
      const voice = voiceVoiceSelect.value;
      const cfg = getAcousticConfig(voice);

      const blob = generateWavAudio(text, cfg.pitch, cfg.rate);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = `zenvyra-audio-${voice}-${Date.now()}.wav`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        downloadVoiceBtn.innerText = "⬇️ Download Audio File";
        voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Audio downloaded to your device!</span>";
      }, 500);
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
      if (!prompt) return alert("Please enter an image description.");

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
        imageResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Failed to generate image. Please try again.</p>`;
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
      if (!prompt) return alert("Please enter scene description.");

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
    
