document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("commandInput");
  const output = document.getElementById("output");

  let globalVolume = 50;
  let currentMedia = null;
  let customCommands = {};

  // Konami Code setup using keyCodes
  const konamiCodeKeyCodes = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let konamiIndex = 0;

  document.addEventListener("keydown", (e) => {
    if (e.keyCode === konamiCodeKeyCodes[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCodeKeyCodes.length) {
        toggleKonochiMode();
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
        handleCommand(command.toLowerCase());
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
      currentMedia.pause?.();
      currentMedia.remove?.();
      currentMedia = null;
    }
  }

  function playVideo(url) {
    stopMedia();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    let container = document.createElement("div");
    container.style.marginTop = "10px";

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
      container.appendChild(iframe);
      typeLine(`▶️ Playing YouTube video: ${url}`);
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
      typeLine(`▶️ Playing video: ${url} at volume ${globalVolume}`);
      currentMedia = video;
    }

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
    typeLine(`🎵 Playing music: ${url} at volume ${globalVolume}`);
  }

  function handleCommand(cmd) {
    const parts = cmd.split(" ");
    const baseCmd = parts[0];

    switch (baseCmd) {
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
          if (currentMedia) currentMedia.volume = globalVolume / 100;
          typeLine(`🔊 Volume set to ${globalVolume}`);
        }
        break;

      case "addcmd":
        if (parts.length < 3) {
          typeLine("Usage: addcmd [command] [response]");
        } else {
          const newCmd = parts[1].toLowerCase();
          const response = cmd.split(" ").slice(2).join(" ");
          customCommands[newCmd] = response;
          typeLine(`✅ Custom command '${newCmd}' added.`);
        }
        break;

      default:
        if (customCommands[baseCmd]) {
          typeLine(customCommands[baseCmd]);
        } else {
          typeLine(`❓ Unknown command: ${baseCmd}`);
        }
    }
  }

  function toggleKonochiMode() {
    typeLine("🎮 Konochi Mode Activated!");
    // Add your custom mode logic or effects here!
    document.body.style.backgroundColor = "#222";
    document.body.style.color = "#0f0";
  }
});
