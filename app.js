document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Switching (Guaranteed tab click fix)
  const navBtns = document.querySelectorAll(".nav-btn");
  const contentPages = document.querySelectorAll(".content-page");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      contentPages.forEach((page) => {
        page.style.display = "none";
      });

      btn.classList.add("active");
      const targetPageId = btn.getAttribute("data-page") + "Page";
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.style.display = "flex";
      }
    });
  });

  // 2. Usage Statistics Manager
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
      if (chatInput) chatInput.value = event.results[0][0].transcript;
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
      const text = voiceTextPrompt ? voiceTextPrompt.value.trim() : "";
      if (!text) return alert("Please enter text or script to speak.");

      playVoiceBtn.disabled = true;
      playVoiceBtn.innerText = "Playing Audio...";
      if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #818cf8;'>Generating voice playback...</span>";

      const selectedVoice = voiceVoiceSelect ? voiceVoiceSelect.value : "hi_female";
      const audioUrl = getAudioUrl(text, selectedVoice);
      const audio = new Audio(audioUrl);

      audio.play().then(() => {
        incrementStat("voice");
        if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Voice playing clearly!</span>";
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
          if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ Playing voice audio!</span>";
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

        incrementStat("voice");
        if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #10b981; font-weight: 600;'>✓ Real MP3 downloaded successfully!</span>";
      } catch (e) {
        window.open(audioUrl, "_blank");
        incrementStat("voice");
        if (voiceStatus) voiceStatus.innerHTML = "<span style='color: #10b981;'>✓ MP3 audio opened for save!</span>";
      } finally {
        downloadVoiceBtn.disabled = false;
        downloadVoiceBtn.innerText = "⬇️ Download MP3 File";
      }
    });
  }

  // 5. Image Generator (Clean & Fast)
  const imagePrompt = document.getElementById("imagePrompt");
  const aspectRatio = document.getElementById("aspectRatio");
  const generateImageBtn = document.getElementById("generateImageBtn");
  const imageResult = document.getElementById("imageResult");

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", async () => {
      const userPrompt = imagePrompt ? imagePrompt.value.trim() : "";
      if (!userPrompt) return alert("Please enter an image description.");

      generateImageBtn.disabled = true;
      generateImageBtn.innerText = "Synthesizing Image...";
      if (imageResult) imageResult.innerHTML = `<p style="color: #94a3b8; font-size: 14px;">🎨 Crafting high-detail artwork...</p>`;

      let width = 1024, height = 1024;
      const ratio = aspectRatio ? aspectRatio.value : "1:1";
      if (ratio === "16:9") { width = 1280; height = 720; }
      else if (ratio === "9:16") { width = 720; height = 1280; }

      const finalPrompt = `${userPrompt}, highly detailed, realistic texture, 8k resolution, cinematic lighting, sharp focus, no watermark`;
      const seed = Math.floor(Math.random() * 9999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`;

      const displayImg = new Image();
      displayImg.src = imageUrl;
      displayImg.style.maxWidth = "100%";
      displayImg.style.borderRadius = "16px";
      displayImg.style.marginTop = "10px";

      displayImg.onload = () => {
        incrementStat("image");
        if (imageResult) {
          imageResult.innerHTML = "";
          imageResult.appendChild(displayImg);

          const dlBtn = document.createElement("button");
          dlBtn.className = "btn-secondary full-width";
          dlBtn.style.marginTop = "10px";
          dlBtn.innerText = "⬇️ Download Clean Image";
          dlBtn.onclick = async () => {
            dlBtn.innerText = "⏳ Saving...";
            try {
              const res = await fetch(imageUrl);
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `zenvyra-art-${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (e) {
              window.open(imageUrl, "_blank");
            }
            dlBtn.innerText = "⬇️ Download Clean Image";
          };
          imageResult.appendChild(dlBtn);
        }

        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate Clean Image →";
      };

      displayImg.onerror = () => {
        if (imageResult) imageResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Failed to generate artwork. Try again.</p>`;
        generateImageBtn.disabled = false;
        generateImageBtn.innerText = "Generate Clean Image →";
      };
    });
  }

  // 6. Video Generator (Safe & Reliable Animation)
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
    generateVideoBtn.addEventListener("click", () => {
      const rawPrompt = videoPrompt ? videoPrompt.value.trim() : "";
      if (!rawPrompt) return alert("Please describe the video scene.");

      const durationSeconds = extractSeconds(rawPrompt);
      const cleanSubject = rawPrompt.replace(/(\d+)\s*(?:seconds?|secs?|s)\b/gi, "").trim();

      generateVideoBtn.disabled = true;
      generateVideoBtn.innerText = `Rendering ${durationSeconds}s Video...`;
      if (videoResult) {
        videoResult.innerHTML = `
          <div style="background: #111827; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px;">
            <p style="color: #f59e0b; font-weight: 700;">🎬 Rendering Video Scene (${durationSeconds}s)...</p>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Rendering frames for: "${cleanSubject}"</p>
          </div>
        `;
      }

      const seed = Math.floor(Math.random() * 1000000);
      const frameUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanSubject + ", cinematic movie scene, 4k, hyper-detailed, dynamic lighting")}&width=1280&height=720&seed=${seed}&nologo=true&enhance=true`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = frameUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 1280;
          canvas.height = 720;

          const stream = canvas.captureStream(30);
          let mime = "video/webm;codecs=vp9";
          if (!MediaRecorder.isTypeSupported(mime)) {
            mime = MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
          }

          let recorder;
          try {
            recorder = new MediaRecorder(stream, { mimeType: mime });
          } catch (e) {
            recorder = new MediaRecorder(stream);
          }

          const chunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          const totalFrames = durationSeconds * 30;
          let frame = 0;
          recorder.start();

          const loop = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const scale = 1.0 + progress * 0.15;
            const panX = Math.sin(progress * Math.PI) * 20;

            ctx.clearRect(0, 0, 1280, 720);
            ctx.save();
            ctx.translate(640 + panX, 360);
            ctx.scale(scale, scale);
            ctx.drawImage(img, -640, -360, 1280, 720);
            ctx.restore();

            if (frame >= totalFrames) {
              clearInterval(loop);
              recorder.stop();
            }
          }, 1000 / 30);

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/mp4" });
            const videoUrl = URL.createObjectURL(blob);
            incrementStat("video");

            if (videoResult) {
              videoResult.innerHTML = `
                <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
                  <div style="width: 100%; border-radius: 16px; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.12);">
                    <video src="${videoUrl}" controls autoplay loop playsinline style="width:100%; max-height:260px; display:block;"></video>
                  </div>
                  <button id="dlRealVideoBtn" class="btn-primary full-width" type="button">⬇️ Download Video (${durationSeconds}s MP4)</button>
                </div>
              `;

              const dlBtn = document.getElementById("dlRealVideoBtn");
              if (dlBtn) {
                dlBtn.onclick = () => {
                  const a = document.createElement("a");
                  a.href = videoUrl;
                  a.download = `zenvyra-video-${durationSeconds}s-${Date.now()}.mp4`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                };
              }
            }

            generateVideoBtn.disabled = false;
            generateVideoBtn.innerText = "🎬 Generate Video →";
          };
        } catch (err) {
          // Fallback if canvas recording blocked
          incrementStat("video");
          if (videoResult) {
            videoResult.innerHTML = `
              <div style="margin-top: 10px;">
                <img src="${frameUrl}" style="width:100%; border-radius:16px;" />
              </div>
            `;
          }
          generateVideoBtn.disabled = false;
          generateVideoBtn.innerText = "🎬 Generate Video →";
        }
      };

      img.onerror = () => {
        if (videoResult) videoResult.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Error generating scene. Please try again.</p>`;
        generateVideoBtn.disabled = false;
        generateVideoBtn.innerText = "🎬 Generate Video →";
      };
    });
  }
});
        
