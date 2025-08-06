document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const input = document.getElementById("commandInput");
  const terminal = document.getElementById("terminal");

  let history = [];
  let historyIndex = 0;
  let currentMedia = null;
  let globalVolume = 50;

  function typeLine(text) {
    output.textContent += text + "\n";
    output.scrollTop = output.scrollHeight;
  }

  function stopMedia() {
    if (currentMedia) {
      if (currentMedia.pause) currentMedia.pause();
      currentMedia.remove();
      currentMedia = null;
      typeLine("🛑 Media stopped.");
    } else {
      typeLine("No media currently playing.");
    }
  }

  function playAudio(url) {
    stopMedia();
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    audio.autoplay = true;
    audio.volume = globalVolume / 100;
    audio.style.width = "100%";
    output.appendChild(audio);
    currentMedia = audio;
    typeLine(`▶️ Playing audio: ${url} at volume ${globalVolume}`);
  }

  function playVideo(url) {
    stopMedia();

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    if (youtubeRegex.test(url)) {
      const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (!videoId) {
        typeLine("⚠️ Invalid YouTube URL.");
        return;
      }
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
      iframe.width = "100%";
      iframe.height = "360";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";
      output.appendChild(iframe);
      currentMedia = iframe;
      typeLine(`▶️ Playing YouTube video: ${url}`);
    } else {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.volume = globalVolume / 100;
      video.style.width = "100%";
      video.style.maxHeight = "360px";
      output.appendChild(video);
      currentMedia = video;
      typeLine(`▶️ Playing video: ${url} at volume ${globalVolume}`);
    }
  }

  async function callAI(prompt) {
    const apiKey = "AIzaSyCTEJO-_5AtzH50CWRO6p-5vDJ5RbmJ1V0"; // Replace with your own key!
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        typeLine(`AI API error: ${errorText}`);
        return;
      }

      const data = await response.json();
      const generatedText =
        data?.candidates?.[0]?.content || "No content generated.";
      typeLine(generatedText);
    } catch (err) {
      typeLine(`Fetch error: ${err.message}`);
    }
  }

  async function handleCommand(cmd) {
    typeLine(`> ${cmd}`);

    const parts = cmd.trim().split(/\s+/);
    const baseCmd = parts[0].toLowerCase();

    switch (baseCmd) {
      case "help":
        typeLine(`Available Commands:
- help
- status
- clear
- ai {prompt}
- playmusic [url]
- playvideo [url]
- volume [1-100]
- stopmedia
- unlock atomicpass`);
        break;

      case "status":
        typeLine(
          "Bypassing... 🔐\nStatus: ATOMIC CORE BREACHED\nEncryption Layers: 0/7"
        );
        break;

      case "clear":
        output.textContent = "";
        break;

      case "ai":
        if (parts.length < 2) {
          typeLine("Usage: ai {prompt}");
        } else {
          const prompt = cmd.slice(3).trim();
          await callAI(prompt);
        }
        break;

      case "playmusic":
        if (parts.length < 2) {
          typeLine("Usage: playmusic [audio_url]");
        } else {
          playAudio(parts[1]);
        }
        break;

      case "playvideo":
        if (parts.length < 2) {
          typeLine("Usage: playvideo [video_url]");
        } else {
          playVideo(parts[1]);
        }
        break;

      case "volume":
        if (parts.length < 2) {
          typeLine(`Current volume: ${globalVolume}`);
        } else {
          let vol = parseInt(parts[1]);
          if (isNaN(vol) || vol < 1 || vol > 100) {
            typeLine("Volume must be a number between 1 and 100.");
          } else {
            globalVolume = vol;
            if (currentMedia && currentMedia.volume !== undefined) {
              currentMedia.volume = globalVolume / 100;
            }
            typeLine(`Volume set to ${globalVolume}.`);
          }
        }
        break;

      case "stopmedia":
        stopMedia();
        break;

      case "unlock":
        if (parts[1] && parts[1].toLowerCase() === "atomicpass") {
          typeLine(
            "🔓 Access Granted: AtomicPass Enabled\nWelcome to the core systems."
          );
        } else {
          typeLine("Unknown unlock code.");
        }
        break;

      default:
        typeLine("Unknown command. Type 'help' for options.");
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = input.value.trim();
      if (cmd) {
        history.push(cmd);
        historyIndex = history.length;
        handleCommand(cmd);
        input.value = "";
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        input.value = "";
      }
    }
  });

  // Konami code: Up Up Down Down Left Right Left Right B A
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        toggleKonochiMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });

  function toggleKonochiMode() {
    terminal.classList.toggle("konochi");
    if (terminal.classList.contains("konochi")) {
      typeLine("🌸 KONOCHI MODE ACTIVATED 🌸");
      document.title = "KONOCHI MODE 💮";
    } else {
      typeLine("KONOCHI MODE DISABLED");
      document.title = "Bypassing-Atomic";
    }
  }

  // Focus input on load
  input.focus();
});
