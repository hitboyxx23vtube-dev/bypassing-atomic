document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("commandInput");
  const output = document.getElementById("output");

  let globalVolume = 50;
  let currentMedia = null;
  let customCommands = {};
  let konochiActive = false;

  // Konami Code keyCodes: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let konamiIndex = 0;

  // Listen on window for Konami code keys
  window.addEventListener("keydown", (e) => {
    const key = e.keyCode || e.which;

    if (key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        activateKonochiMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = input.value.trim();
      if (command !== "") {
        output.innerHTML += `<div class="command">> ${command}</div>`;
        handleCommand(command);
        input.value = "";
        output.scrollTop = output.scrollHeight;
      }
    }
  });

  function typeLine(text) {
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function stopMedia() {
    if (currentMedia) {
      if (typeof currentMedia.pause === "function") currentMedia.pause();
      if (typeof currentMedia.remove === "function") currentMedia.remove();
      currentMedia = null;
    }
  }

  function playVideo(url) {
    stopMedia();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    const container = document.createElement("div");
    container.style.marginTop = "10px";

    if (youtubeRegex.test(url)) {
      const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match ? match[1] : null;
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
      container.appendChild(iframe);
      currentMedia = iframe;
    } else {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.volume = globalVolume / 100;
      video.style.width = "100%";
      video.style.maxHeight = "360px";
      container.appendChild(video);
      currentMedia = video;
    }

    typeLine(`▶️ Playing video: ${url}`);
    output.appendChild(container);
  }

  function playMusic(url) {
    stopMedia();
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    audio.autoplay = true;
    audio.volume = globalVolume / 100;
    audio.style.width = "100%";
    currentMedia = audio;
    output.appendChild(audio);
    typeLine(`🎵 Playing music: ${url}`);
  }

  function activateKonochiMode() {
    if (!konochiActive) {
      konochiActive = true;
      typeLine("🎮 Konochi Mode Activated!");
      document.body.style.backgroundColor = "#111";
      document.body.style.color = "#0ff";
      document.title = "KONOCHI MODE 💮";
    }
  }

  function deactivateKonochiMode() {
    if (konochiActive) {
      konochiActive = false;
      typeLine("🛑 Konochi Mode Deactivated.");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.title = "Bypassing-Atomic";
    }
  }

  function handleCommand(cmd) {
    if (!cmd || cmd.trim() === "") return;

    const parts = cmd.trim().split(/\s+/);
    if (parts.length === 0) return;

    const baseCmd = parts[0].toLowerCase();

    // Special: Check for "konochi mode off"
    if (
      parts.length === 3 &&
      parts[0].toLowerCase() === "konochi" &&
      parts[1].toLowerCase() === "mode" &&
      parts[2].toLowerCase() === "off"
    ) {
      if (konochiActive) {
        deactivateKonochiMode();
      } else {
        typeLine("Konochi mode is not active.");
      }
      return;
    }

    switch (baseCmd) {
      case "help":
        typeLine("Available commands:");
        typeLine("- help : Show this help message");
        typeLine("- clear : Clear the terminal output");
        typeLine("- playvideo [url] : Play a YouTube or video URL");
        typeLine("- playmusic [url] : Play audio/music URL");
        typeLine("- stop : Stop current media");
        typeLine("- volume [0-100] : Set volume");
        typeLine("- addcmd [name] [response] : Add a custom command");
        typeLine("- konochi : Toggle Konochi Mode ON");
        typeLine("- konochi mode off : Turn OFF Konochi Mode");
        break;

      case "clear":
        output.textContent = "";
        break;

      case "playvideo":
        if (parts.length < 2) {
          typeLine("Usage: playvideo [url]");
        } else {
          const url = parts.slice(1).join(" ");
          playVideo(url);
        }
        break;

      case "playmusic":
        if (parts.length < 2) {
          typeLine("Usage: playmusic [url]");
        } else {
          const url = parts.slice(1).join(" ");
          playMusic(url);
        }
        break;

      case "stop":
        stopMedia();
        typeLine("⏹️ Media stopped.");
        break;

      case "volume":
        if (parts.length < 2 || isNaN(parts[1])) {
          typeLine("Usage: volume [0-100]");
        } else {
          globalVolume = Math.max(0, Math.min(100, parseInt(parts[1])));
          if (currentMedia && "volume" in currentMedia) currentMedia.volume = globalVolume / 100;
          typeLine(`🔊 Volume set to ${globalVolume}`);
        }
        break;

      case "addcmd":
        if (parts.length < 3) {
          typeLine("Usage: addcmd [name] [response]");
        } else {
          const name = parts[1].toLowerCase();
          const response = parts.slice(2).join(" ");
          customCommands[name] = response;
          typeLine(`✅ Command '${name}' added.`);
        }
        break;

      case "konochi":
        // Toggle Konochi mode on manually (except for "konochi mode off" which is handled above)
        activateKonochiMode();
        break;

      default:
        if (customCommands[baseCmd]) {
          typeLine(customCommands[baseCmd]);
        } else {
          typeLine(`❓ Unknown command: ${baseCmd}`);
        }
    }
  }
});
