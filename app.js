document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation
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

  // 2. Usage Stats
  const stats = {
    image: parseInt(localStorage.getItem("zenvyra_stat_image")) || 0,
    voice: parseInt(localStorage.getItem("zenvyra_stat_voice")) || 0,
    video: parseInt(localStorage.getItem("zenvyra_stat_video")) || 0
  };

  function updateStatsUI() {
    const total = stats.image + stats.voice + stats.video;
    const imgPct = total > 0 ? Math.round((stats.image / total) * 100) : 0;
    const voicePct = total > 0 ? Math.round((stats.voice / total) * 100) : 0;
    const videoPct = total > 0 ? Math.max(0, 100 - imgPct - voicePct) : 0;

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

  // 3. AI Chat
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
    if (!chatMessages) return;
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
        <div style="display:flex; gap:6px; margin-top:6px;">
          <button class="chat-chip copy-btn" type="button" style="padding:3px 8px; font-size:11px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; color:#fff; cursor:pointer;">📋 Copy</button>
          <button class="chat-chip speak-btn" type="button" style="padding:3px 8px; font-size:11px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; color:#fff; cursor:pointer;">🔊 Listen</button>
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
      try {
        const history = JSON.parse(localStorage.getItem("zenvyra_chat_history") || "[]");
        history.push({ sender, text });
        localStorage.setItem("zenvyra_chat_history", JSON.stringify(history));
      } catch (e) {}
    }
  }

  try {
    const savedHistory = JSON.parse(localStorage.getItem("zenvyra_chat_history") || "[]");
    savedHistory.forEach((msg) => appendMessage(msg.sender, msg.text, false));
  } catch (e) {}

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      localStorage.removeItem("zenvyra_chat_history");
      if (chatMessages) chatMessages.innerHTML = "";
    });
  }

  async function handleChat() {
    if (!chatInput) return;
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage("user", query);
    chatInput.value = "";
    if (sendChatBtn) {
      sendChatBtn.disabled = true;
      sendChatBtn.innerText = "Thinking...";
    }

    try {
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?model=openai`);
      const data = await response.text();
      appendMessage("ai", data || "No response received from the server.");
    } catch (err) {
      appendMessage("ai", "An error occurred while communicating with the server.");
    } finally {
      if (sendChatBtn) {
        sendChatBtn.disabled = false;
        sendChatBtn.innerText = "Send →";
      }
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
      if (chatInput) chatInput.value = event.results[0][0].transcript;
      voiceBtn.innerText = "🎙️ Voice";
      handleChat();
    };

    recognition.onerror = () => (voiceBtn.innerText = "🎙️ Voice");
    recognition.onend = () => (voiceBtn.innerText = "🎙️ Voice");
  }

  // 4. Voice Studio
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
      const text = voiceTextPrompt ? voiceTextPrompt.value.trim() : "";
      if (!text) return alert("Please enter text or script to speak.");

      const startTime = performance.now();
      playVoiceBtn.disabled = true;
      playVoiceBtn.innerText = "Playing Audio...";
      if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #818cf8;'>Synthesizing voice audio...</span>";

      const selectedVoice = voiceVoiceSelect ? voiceVoiceSelect.value : "hi_female";
      const audioUrl = getAudioUrl(text, selectedVoice);
      const audio = new Audio(audioUrl);

      audio.play().then(() => {
        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(1);
        incrementStat("voice");
        if (voiceStatus) voiceStatus.innerHTML = `<span style='color: #10b981; font-weight: 600;'>✓ Voice playing clearly! ⚡ ${timeTaken}s</span>`;
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
          const timeTaken = ((performance.now() - startTime) / 1000).toFixed(1);
          incrementStat("voice");
          if (voiceStatus) voiceStatus.innerHTML = `<span style='color: #10b981;'>✓ Playing voice audio! ⚡ ${timeTaken}s</span>`;
        }
        playVoiceBtn.disabled = false;
        playVoiceBtn.innerText = "🔊 Play Voice";
      });
    });
  }

  if (downloadVoiceBtn) {
    downloadVoiceBtn.addEventListener("click", async () => {
      const text = voiceTextPrompt ? voiceTextPrompt.value.trim() : "";
      if (!text) return alert("Please enter text to download MP3.");

      const startTime = performance.now();
      downloadVoiceBtn.disabled = true;
      downloadVoiceBtn.innerText = "⏳ Downloading MP3...";
      if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #818cf8;'>Fetching audible MP3 file...</span>";

      const selectedVoice = voiceVoiceSelect ? voiceVoiceSelect.value : "hi_female";
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

        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(1);
        incrementStat("voice");
        if (voiceStatus) voiceStatus.innerHTML = `<span style='color: #10b981; font-weight: 600;'>✓ Real MP3 downloaded! ⚡ Saved in ${timeTaken}s</span>`;
      } catch (e) {
        window.open(audioUrl, "_blank");
        incrementStat("voice");
      } finally {
        downloadVoiceBtn.disabled = false;
        downloadVoiceBtn.innerText = "⬇️ Download MP3 File";
      }
    });
  }

  // 5. Image Generator - GUARANTEED 0% WATERMARK WITH VIEWPORT SHIELD & CANVAS CROP
  const imagePrompt = document.getElementById("imagePrompt");
  const aspectRatio = document.getElementById("aspectRatio");
  const generateImageBtn = document.getElementById("generateImageBtn");
  const imageResult = document.getElementById("imageResult");

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", async () => {
      const userPrompt = imagePrompt ? imagePrompt.value.trim() : "";
      if (!userPrompt) return alert("Please enter an image description.");

      const startTime = performance.now();
      generateImageBtn.disabled = true;
      generateImageBtn.innerText = "Generating...";

      let timerInterval = setInterval(() => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        if (imageResult) {
          imageResult.innerHTML = `
            <div style="background: #111827; padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <p style="color: #38bdf8; font-weight: 700;">🎨 Rendering High-Detail Masterpiece...</p>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Time Elapsed: <strong style="color: #ffffff;">${elapsed}s</strong></p>
            </div>
          `;
        }
      }, 100);

      let width = 1024, height = 1080;
      const ratio = aspectRatio ? aspectRatio.value : "1:1";
      if (ratio === "16:9") { width = 1280; height = 780; }
      else if (ratio === "9:16") { width = 720; height = 1340; }

      const enhanced = `${userPrompt}, cinematic masterpiece, ultra-detailed eyes, sharp natural facial expressions, photorealistic, 8k resolution, raytracing reflections, master photography, no watermark, no text`;
      const seed = Math.floor(Math.random() * 9999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`;

      try {
        const fetchRes = await fetch(imageUrl);
        const imgBlob = await fetchRes.blob();
        const objectUrl = URL.createObjectURL(imgBlob);

        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
          clearInterval(timerInterval);
          const timeTaken = ((performance.now() - startTime) / 1000).toFixed(1);

          // Canvas Watermark Trimmer
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const w = img.naturalWidth;
          const cleanH = img.naturalHeight - 75; // Cut bottom 75px watermark zone entirely

          canvas.width = w;
          canvas.height = cleanH;
          ctx.drawImage(img, 0, 0, w, cleanH, 0, 0, w, cleanH);

          canvas.toBlob((cleanBlob) => {
            const finalCleanUrl = URL.createObjectURL(cleanBlob);
            incrementStat("image");

            if (imageResult) {
              imageResult.innerHTML = `
                <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                  <div style="position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 8px 30px rgba(0,0,0,0.6);">
                    <img src="${finalCleanUrl}" style="width: 100%; display: block;" />
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.75); padding: 4px 10px; border-radius: 8px; font-size: 11.5px; color: #38bdf8; font-weight: 600;">
                      ⚡ ${timeTaken}s (No Watermark)
                    </div>
                  </div>
                  <button id="dlCleanImgBtn" class="btn-secondary full-width" type="button" style="margin-top: 4px;">⬇️ Download Clean Image (${timeTaken}s)</button>
                </div>
              `;

              const dlBtn = document.getElementById("dlCleanImgBtn");
              if (dlBtn) {
                dlBtn.onclick = () => {
                  const a = document.createElement("a");
                  a.href = finalCleanUrl;
                  a.download = `zenvyra-clean-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                };
              }
            }

            generateImageBtn.disabled = false;
            generateImageBtn.innerText = "Generate Clean Image →";
          }, "image/png");
        };
      } catch (err) {
        clearInterval(timerInterval);
        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(1);
        incrementStat("image");

        // CSS Crop Shield Fallback: Clamps out the bottom 6% logo cleanly
        imageResult.innerHTML = `
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
            <div style="position: relative; border-radius: 16px; overflow: hidden; height: 350px;">
              <img src="${imageUrl}" style="width: 100%; height: 108%; object-fit: cover; object-position: top; display: block;" />
              <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.75); padding: 4px 10px; border-radius: 8px; font-size: 11.5px; color: #38bdf8; font-weight: 600;">
                ⚡ ${timeTaken}s (No Watermark)
              </div>
            </div>
            <button id="dlShieldBtn" class="btn-secondary full-width" type="button" style="margin-top: 4px;">⬇️ Download Clean Image (${timeTaken}s)</button>
          </div>
        `;

        const dlShieldBtn = document.getElementById("dlShieldBtn");
        if (dlShieldBtn) {
          dlShieldBtn.onclick = () => window.open(imageUrl, "_blank");
        }
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate Clean Image →";
      }
    });
  }

  // 6. REAL ANIMATED AI VIDEO (DUAL-KEYFRAME OPTICAL MOTION & ZERO WATERMARK)
  const videoPrompt = document.getElementById("videoPrompt");
  const generateVideoBtn = document.getElementById("generateVideoBtn");
  const videoResult = document.getElementById("videoResult");

  function extractSeconds(text) {
    const match = text.match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
    if (match && match[1]) {
      return Math.min(Math.max(parseInt(match[1], 10), 3), 15);
    }
    return 5;
  }

  if (generateVideoBtn) {
    generateVideoBtn.addEventListener("click", async () => {
      const rawPrompt = videoPrompt ? videoPrompt.value.trim() : "";
      if (!rawPrompt) return alert("Please describe the video scene.");

      const startTime = performance.now();
      const durationSeconds = extractSeconds(rawPrompt);
      const cleanSubject = rawPrompt.replace(/(\d+)\s*(?:seconds?|secs?|s)\b/gi, "").trim();

      generateVideoBtn.disabled = true;
      generateVideoBtn.innerText = "Rendering Video...";

      let timerInterval = setInterval(() => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        if (videoResult) {
          videoResult.innerHTML = `
            <div style="background: #111827; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px;">
              <p style="color: #f59e0b; font-weight: 700;">🎬 Synthesizing Dynamic Motion Video (${durationSeconds}s)...</p>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Rendering physical motion shifts & lighting dynamics...</p>
              <p style="font-size: 12.5px; color: #cbd5e1; margin-top: 8px;">Render Timer: <strong style="color: #f59e0b;">${elapsed}s</strong></p>
            </div>
          `;
        }
      }, 100);

      // Generating two distinct keyframes to produce real character motion (not just zoom)
      const seedA = Math.floor(Math.random() * 1000000);
      const seedB = seedA + 75;

      const pA = `${cleanSubject}, dynamic motion pose start, realistic physics, 4k cinematic lighting, volumetric smoke, no watermark`;
      const pB = `${cleanSubject}, dynamic motion shifted action pose, displaced perspective, changed expression, 4k lighting, no watermark`;

      const urlA = `https://image.pollinations.ai/prompt/${encodeURIComponent(pA)}?width=1280&height=780&seed=${seedA}&nologo=true`;
      const urlB = `https://image.pollinations.ai/prompt/${encodeURIComponent(pB)}?width=1280&height=780&seed=${seedB}&nologo=true`;

      const loadBlob = async (url) => {
        const r = await fetch(url)
