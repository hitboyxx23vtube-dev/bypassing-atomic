document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("commandInput");
  const output = document.getElementById("output");

  let globalVolume = 50;
  let currentMedia = null;
  let customCommands = {};
  let konochiActive = false;

  // Alias map for commands
  const aliasMap = {
    cls: "clear",
    cmds: "help",
  };

  // Konami Code keyCodes: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let konamiIndex = 0;

  // Listen for Konami code to activate Konochi Mode
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

  // Activate Konochi Mode
  function activateKonochiMode() {
    if (!konochiActive) {
      konochiActive = true;
      typeLine("🎮 Konochi Mode Activated!");
      document.body.style.backgroundColor = "#111";
      document.body.style.color = "#0ff";
      document.title = "KONOCHI MODE 💮";
      typeLine("Command available: konochi off");
    }
  }

  // Deactivate Konochi Mode
  function deactivateKonochiMode() {
    if (konochiActive) {
      konochiActive = false;
      typeLine("🛑 Konochi Mode Deactivated.");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.title = "Bypassing-Atomic";
    }
  }

  async function callAI(prompt) {
    const apiKey = "AIzaSyCTEJO-_5AtzH50CWRO6p-5vDJ5RbmJ1V0"; // Replace with your own key if needed
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
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
      const generatedText = data?.candidates?.[0]?.content || "No content generated.";
      typeLine(generatedText);
    } catch (err) {
      typeLine(`Fetch error: ${err.message}`);
    }
  }

  function handleCommand(cmd) {
    if (!cmd || cmd.trim() === "") return;

    const parts = cmd.trim().split(/\s+/);
    if (parts.length === 0) return;

    const baseCmd = parts[0].toLowerCase();

    // Map aliases
    const commandKey = aliasMap[baseCmd] || baseCmd;

    switch (commandKey) {
      case "help":
        typeLine("Available commands:");
        typeLine("- help (cmds) : Show this help message");
        typeLine("- clear (cls) : Clear the terminal output");
        typeLine("- playvideo [url] : Play a YouTube or video URL");
        typeLine("- playmusic [url] : Play audio/music URL");
        typeLine("- stop : Stop current media");
        typeLine("- volume [0-100] : Set volume");
        typeLine("- addcmd [name] [response] : Add a custom command");
        typeLine("- konochi : Toggle Konochi Mode ON");
        if (konochiActive) typeLine("- konochi off : Turn OFF Konochi Mode");
        typeLine("- ai {prompt} : Ask AI");

        // List user-added commands
        const userCmds = Object.keys(customCommands);
        if (userCmds.length) {
          typeLine("User commands:");
          userCmds.forEach(c => typeLine(`- ${c}`));
        }
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
        activateKonochiMode();
        break;

      case "konochioff":
      case "konochi-off":
      case "konochi_off":
        if (konochiActive) {
          deactivateKonochiMode();
        } else {
          typeLine("Konochi mode is not active.");
        }
        break;

      case "ai":
        if (parts.length < 2) {
          typeLine("Usage: ai {prompt}");
        } else {
          const prompt = cmd.slice(3).trim();
          callAI(prompt);
        }
        break;

      default:
        if (customCommands[commandKey]) {
          typeLine(customCommands[commandKey]);
        } else {
          typeLine(`❓ Unknown command: ${commandKey}`);
        }
    }
  }
});
