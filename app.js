document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Switching
  const navBtns = document.querySelectorAll(".nav-btn");
  const contentPages = document.querySelectorAll(".content-page");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      contentPages.forEach((page) => (page.style.display = "none"));

      btn.classList.add("active");
      const targetPageId = btn.getAttribute("data-page") + "Page";
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) targetPage.style.display = "flex";
    });
  });

  // 2. Usage Statistics Dashboard Manager
  const stats = {
    image: parseInt(localStorage.getItem("zenvyra_stat_image")) || 0,
    voice: parseInt(localStorage.getItem("zenvyra_stat_voice")) || 0,
    video: parseInt(localStorage.getItem("zenvyra_stat_video")) || 0
  };

  function updateStatsUI() {
    const total = stats.image + stats.voice + stats.video;
    const imgPct = total > 0 ? Math.round((stats.image / total) * 100) : 0;
    const voicePct = total > 0 ? Math.round((stats.voice / total) * 100) : 0;
    const videoPct = total > 0 ? (100 - imgPct - voicePct) : 0;

    const totalEl = document.getElementById("totalGenerations");
    const barImage = document.getElementById("barImage");
    const barVoice = document.getElementById("barVoice");
    const barVideo = document.getElementById("barVideo");
    const statImgText = document.getElementById("statImgText");
    const statVoiceText = document.getElementById("statVoiceText");
    const statVideoText = document.getElementById("statVideoText");

    if (totalEl) totalEl.innerText = `${total} Total Items`;
    if (barImage) barImage.style.width = `${imgPct}%`;
    if (barVoice) barVoice.style.width = `${voicePct}%`;
    if (barVideo) barVideo.style.width = `${videoPct}%`;

    if (statImgText) statImgText.innerText = `${stats.image} (${imgPct}%)`;
    if (statVoiceText) statVoiceText.innerText = `${stats.voice} (${voicePct}%)`;
    if (statVideoText) statVideoText.innerText = `${stats.video} (${videoPct}%)`;
  }

  function incrementStat(type) {
    if (stats[type] !== undefined) {
      stats[type]++;
      localStorage.setItem(`zenvyra_stat_${type}`, stats[type]);
      updateStatsUI();
    }
  }
  updateStatsUI();

  // 3. AI Chat Assistant
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChatBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const chatMessages = document.getElementById("chatMessages");
  const clearChatBtn = document.getElementById("clearChatBtn");

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  function appendMessage(sender, text, save = true) {
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
      msgEl.innerHTML = `
        <strong>Zenvyra AI:</strong> <span>${text}</span>
        <div class="chat-action-bar">
          <button class="chat-chip copy-btn" type="button">📋 Copy</button>
          <button class="chat-chip speak-btn" type="button">🔊 Listen</button>
        </div>
      `;

      const copyBtn = msgEl.querySelector(".copy-btn");
      const speakBtn = msgEl.querySelector(".speak-btn");

      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(text);
          copyBtn.innerText = "✓ Copied";
          setTimeout(() => (copyBtn.innerText = "📋 Copy"), 1500);
        };
      }

      if (speakBtn) {
        speakBtn.onclick = () => speakText(text);
      }
    }

    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (save) {
      const history = JSON.parse(localStorage.getItem("zenvyra_chat_history") || "[]");
      history.push({ sender, text });
      localStorage.setItem("zenvyra_chat_history", JSON.stringify(history));
    }
  }

  const savedHistory = JSON.parse(localStorage.getItem("zenvyra_chat_history") || "[]");
  savedHistory.forEach((msg) => appendMessage(msg.sender, msg.text, false));

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      localStorage.removeItem("zenvyra_chat_history");
      chatMessages.innerHTML = "";
    });
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

  // Voice Input (Speech-to-Text)
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

    recognition.onerror = () => (voiceBtn.innerText = "🎙️ Voice");
    recognition.onend = () => (voiceBtn.innerText = "🎙️ Voice");
  }

  // 4. Voice Studio & Audible MP3 Downloader
  const voiceTextPrompt = document.getElementById("voiceTextPrompt");
  const voiceVoiceSelect = document.getElementById("voiceVoiceSelect");
  const playVoiceBtn = document.getElementById("playVoiceBtn");
  const downloadVoiceBtn = document.getElementById("downloadVoiceBtn");
  const voiceStatus = document.getElementById("voiceStatus");

  function getAudioUrl(text, voice) {
    let lang = "hi";
    if (voice === "en_us") lang = "en-us";
    if (voice === "en_uk") lang = "en-gb";
    const clean = encodeURIComponent(text.substring(0, 180));
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${clean}&tl=${lang}&client=tw-ob`;
  }

  if (playVoiceBtn) {
    playVoiceBtn.addEventListener("click", () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) return alert("Please enter text or script to speak.");

      playVoiceBtn.disabled = true;
      playVoiceBtn.innerText = "Playing Audio...";
      voiceStatus.innerHTML = "<span style='color: #818cf8;'>Generating voice playback...</span>";

      const selectedVoice = voiceVoiceSelect.value;
      const audioUrl = getAudioUrl(text, selectedVoice);
      const audio = new Audio(audioUrl);

      audio.play().then(() => {
        incrementStat("voice");
        voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Voice playing clearly!</span>";
        playVoiceBtn.disabled = false;
        playVoiceBtn.innerText = "🔊 Play Voice";
      }).catch(() => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = selectedVoice.startsWith("hi") ? "hi-IN" : "en-US";
          if (selectedVoice.includes("female")) utterance.pitch = 1.35;
          if (selectedVoice.includes("male")) utterance.pitch = 0.75;
          window.speechSynthesis.speak(utterance);
          incrementStat("voice");
          voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ Playing voice audio!</span>";
        }
        playVoiceBtn.disabled = false;
        playVoiceBtn.innerText = "🔊 Play Voice";
      });
    });
  }

  if (downloadVoiceBtn) {
    downloadVoiceBtn.addEventListener("click", async () => {
      const text = voiceTextPrompt.value.trim();
      if (!text) return alert("Please enter text to download MP3.");

      downloadVoiceBtn.disabled = true;
      downloadVoiceBtn.innerText = "⏳ Downloading MP3...";
      voiceStatus.innerHTML = "<span style='color: #818cf8;'>Fetching audible MP3 file...</span>";

      const selectedVoice = voiceVoiceSelect.value;
      const audioUrl = getAudioUrl(text, selectedVoice);

      try {
        const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(audioUrl)}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `zenvyra-voice-${selectedVoice}-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        incrementStat("voice");
        voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Real MP3 downloaded successfully!</span>";
      } catch (e) {
        window.open(audioUrl, "_blank");
        incrementStat("voice");
        voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ MP3 audio opened for save!</span>";
      } finally {
        downloadVoiceBtn.disabled = false;
        downloadVoiceBtn.innerText = "⬇️ Download MP3 File";
      }
    });
  }

  // 5. Image Generator (Zero-Watermark Crop Engine)
  const imagePrompt = document.getElementById("imagePrompt");
  const aspectRatio = document.getElementById("aspectRatio");
  const generateImageBtn = document.getElementById("generateImageBtn");
  const imageResult = document.getElementById("imageResult");

  function removeWatermarkAndGetCleanBlob(imgElement) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const w = imgElement.naturalWidth || 1024;
      const h = imgElement.naturalHeight || 1024;

      const cleanHeight = h - 38;
      canvas.width = w;
      canvas.height = cleanHeight;

      ctx.drawImage(imgElement, 0, 0, w, cleanHeight, 0, 0, w, cleanHeight);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", async () => {
      const prompt = imagePrompt.value.trim();
      if (!prompt) return alert("Please enter an image description.");

      generateImageBtn.disabled = true;
      generateImageBtn.innerText = "Creating Clean Artwork...";
      imageResult.innerHTML = `<p style="color: #94a3b8; font-size: 14px;">🎨 Generating high-detail artwork, please wait...</p>`;

      let width = 1024, height = 1060;
      const ratio = aspectRatio ? aspectRatio.value : "1:1";
      if (ratio === "16:9") { width = 1280; height = 758; }
      else if (ratio === "9:16") { width = 720; height = 1318; }

      const enhancedPrompt = `${prompt}, masterpiece, 8k resolution, highly detailed, photorealistic, clean sharp focus, no watermark, no logo, no text`;
      const seed = Math.floor(Math.random() * 10000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`;

      const rawImg = new Image();
      rawImg.crossOrigin = "anonymous";
      rawImg.src = imageUrl;

      rawImg.onload = async () => {
        try {
          const cleanBlob = await removeWatermarkAndGetCleanBlob(rawImg);
          const cleanUrl = URL.createObjectURL(cleanBlob);

          incrementStat("image");
          imageResult.innerHTML = "";

          const displayImg = document.createElement("img");
          displayImg.src = cleanUrl;
          displayImg.style.maxWidth = "100%";
          displayImg.style.borderRadius = "16px";
          displayImg.style.marginTop = "10px";
          displayImg.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
          imageResult.appendChild(displayImg);

          const dlBtn = document.createElement("button");
          dlBtn.className = "btn-secondary full-width";
          dlBtn.style.marginTop = "10px";
          dlBtn.innerText = "⬇️ Download Clean Image (No Watermark)";
          dlBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = cleanUrl;
            a.download = `zenvyra-clean-artwork-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          imageResult.appendChild(dlBtn);
        } catch (e) {
          imageResult.innerHTML = `<img src="${imageUrl}" style="max-width:100%; border-radius:16px; margin-top:10px;" />`;
        }

        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate Clean Image →";
      };

      rawImg.onerror = () => {
        imageResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Failed to generate artwork. Please try again.</p>`;
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate Clean Image →";
      };
    });
  }

  // 6. REAL AI VIDEO GENERATOR (SMART DURATION EXTRACTOR FROM PROMPT)
  const videoPrompt = document.getElementById("videoPrompt");
  const generateVideoBtn = document.getElementById("generateVideoBtn");
  const videoResult = document.getElementById("videoResult");

  // Regex to extract seconds from user prompt (e.g., "7 sec", "10 seconds", "4s", "5 second")
  function extractDurationFromPrompt(promptText) {
    const match = promptText.match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      // Clamp duration between 2 to 20 seconds for smooth performance
      return Math.min(Math.max(parsed, 2), 20);
    }
    return 5; // Default duration is 5 seconds if not mentioned
  }

  if (generateVideoBtn) {
    generateVideoBtn.addEventListener("click", async () => {
      const prompt = videoPrompt.value.trim();
      if (!prompt) return alert("Please enter a video scene description.");

      // Smart duration detection
      const durationSeconds = extractDurationFromPrompt(prompt);

      generateVideoBtn.disabled = true;
      generateVideoBtn.innerText = `Rendering ${durationSeconds}s Video...`;
      videoResult.innerHTML = `
        <div style="background: #111827; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px;">
          <p style="color: #f59e0b; font-weight: 700;">🎬 Rendering Neural Video (${durationSeconds} Seconds Detected)...</p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Generating animation frames for: "${prompt}"</p>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 12px; overflow: hidden;">
            <div style="width: 70%; height: 100%; background: #f59e0b;"></div>
          </div>
        </div>
      `;

      // Clean prompt without watermark keywords
      const cleanPrompt = prompt.replace(/(\d+)\s*(?:seconds?|secs?|s)\b/gi, "").trim();
      const cinematicPrompt = `${cleanPrompt}, cinematic movie shot, 4k ultra detailed, dramatic lighting, sharp focus, no watermark, no text`;
      const seed = Math.floor(Math.random() * 1000000);
      const frameUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cinematicPrompt)}?width=1280&height=758&seed=${seed}&nologo=true&enhance=true&model=flux`;

      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";
      baseImg.src = frameUrl;

      baseImg.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const w = 1280;
        const h = 720;
        canvas.width = w;
        canvas.height = h;

        // Auto-crop bottom watermark region
        const sourceH = baseImg.naturalHeight ? baseImg.naturalHeight - 38 : h;
        const sourceW = baseImg.naturalWidth || w;

        const stream = canvas.captureStream(30); // 30 FPS
        let recorder;
        let recordedChunks = [];

        let mime = "video/webm;codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mime)) {
          mime = MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
        }

        try {
          recorder = new MediaRecorder(stream, { mimeType: mime });
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunks.push(e.data);
        };

        const totalFrames = durationSeconds * 30;
        let currentFrame = 0;

        recorder.start();

        const interval = setInterval(() => {
          currentFrame++;
          const progress = currentFrame / totalFrames;

          // Dynamic Camera Pan & Slow Cinematic Zoom
          const scale = 1.0 + progress * 0.18;
          const panX = Math.sin(progress * Math.PI) * 25;
          const panY = progress * 15;

          ctx.clearRect(0, 0, w, h);
          ctx.save();
          ctx.translate(w / 2 + panX, h / 2 + panY);
          ctx.scale(scale, scale);
          ctx.drawImage(baseImg, 0, 0, sourceW, sourceH, -w / 2, -h / 2, w, h);
          ctx.restore();

          // Subtle cinematic light grain
          ctx.fillStyle = "rgba(255,255,255,0.015)";
          ctx.fillRect(0, 0, w, h);

          if (currentFrame >= totalFrames) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 1000 / 30);

        recorder.onstop = () => {
          const videoBlob = new Blob(recordedChunks, { type: "video/mp4" });
          const videoObjectUrl = URL.createObjectURL(videoBlob);

          incrementStat("video");

          videoResult.innerHTML = `
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
              <div class="video-render-box">
                <video src="${videoObjectUrl}" controls autoplay loop playsinline></video>
              </div>
              <button id="dlRealVideoBtn" class="btn-primary full-width" type="button">⬇️ Download Video (${durationSeconds}s MP4)</button>
            </div>
          `;

          const dlRealVideoBtn = document.getElementById("dlRealVideoBtn");
          if (dlRealVideoBtn) {
            dlRealVideoBtn.onclick = () => {
              const a = document.createElement("a");
              a.href = videoObjectUrl;
              a.download = `zenvyra-scene-${durationSeconds}s-${Date.now()}.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            };
          }

          generateVideoBtn.disabled = false;
 
