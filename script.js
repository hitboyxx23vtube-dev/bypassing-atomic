const output = document.getElementById("output");
const input = document.getElementById("input");
const terminal = document.getElementById("terminal");

input.focus();

let history = [];
let historyIndex = 0;

let currentMedia = null; // current audio/video/iframe element
let globalVolume = 50; // default volume 50%

// Typing helper (returns promise)
function typeLine(text, delay = 20) {
  return new Promise(resolve => {
    let i = 0;
    const line = document.createElement("div");
    output.appendChild(line);

    const interval = setInterval(() => {
      line.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        output.scrollTop = output.scrollHeight;
        resolve();
      }
    }, delay);
  });
}

// Remove any playing media
function stopMedia() {
  if (currentMedia) {
    if (currentMedia.pause) currentMedia.pause();
    currentMedia.remove();
    currentMedia = null;
    typeLine("🛑 Media stopped.");
  } else {
    typeLine("No media is currently playing.");
  }
}

// Play audio
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

// Play video or YouTube
function playVideo(url) {
  stopMedia();

  const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

  if (isYouTube) {
    // Extract video ID from URL
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
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.border = "none";
    output.appendChild(iframe);
    currentMedia = iframe;
    typeLine(`▶️ Playing YouTube video: ${url}`);
  } else {
    // Regular video file
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

// Main command handler
async function handleCommand(cmd) {
  await typeLine(`> ${cmd}`);

  const parts = cmd.trim().split(/\s+/);
  const baseCmd = parts[0].toLowerCase();

  switch (baseCmd) {
    case "help":
      await typeLine(`Available Commands:
- help: show this message
- status: system status
- clear: clear terminal
- playmusic [url]: play audio with current volume (${globalVolume})
- playvideo [url]: play video or YouTube with current volume (${globalVolume})
- volume [1-100]: set global volume
- stopmedia: stop any playing media
- unlock atomicpass: ???`);
      break;

    case "status":
      await typeLine("Bypassing... 🔐\nStatus: ATOMIC CORE BREACHED\nEncryption Layers: 0/7");
      break;

    case "clear":
      output.innerHTML = "";
      break;

    case "playmusic":
      if (parts.length < 2) {
        await typeLine("Usage: playmusic [audio_url]");
      } else {
        playAudio(parts[1]);
      }
      break;

    case "playvideo":
      if (parts.length < 2) {
        await typeLine("Usage: playvideo [video_url]");
      } else {
        playVideo(parts[1]);
      }
      break;

    case "volume":
      if (parts.length < 2) {
        await typeLine(`Current volume: ${globalVolume}`);
      } else {
        let vol = parseInt(parts[1]);
        if (isNaN(vol) || vol < 1 || vol > 100) {
          await typeLine("Volume must be a number between 1 and 100.");
        } else {
          globalVolume = vol;
          if (currentMedia && currentMedia.volume !== undefined) {
            currentMedia.volume = globalVolume / 100;
          }
          await typeLine(`Volume set to ${globalVolume}.`);
        }
      }
      break;

    case "stopmedia":
      stopMedia();
      break;

    case "unlock":
      if (parts[1] && parts[1].toLowerCase() === "atomicpass") {
        await typeLine("🔓 Access Granted: AtomicPass Enabled\nWelcome to the core systems.");
        // Add any secret functionality here
      } else {
        await typeLine("Unknown unlock code.");
      }
      break;

    default:
      await typeLine("Unknown command. Type 'help' for options.");
  }
}

// Input event listeners and history navigation
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const cmd = input.textContent.trim();
    if (cmd !== "") {
      history.push(cmd);
      historyIndex = history.length;
      handleCommand(cmd);
      input.textContent = "";
    }
  } else if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.textContent = history[historyIndex];
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.textContent = history[historyIndex];
    } else {
      input.textContent = "";
    }
    e.preventDefault();
  }
});

// --- Konochi Mode: Konami Code Activation ---
const konamiCode = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a"
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

// Toggle Konochi Mode (only by konami code)
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
