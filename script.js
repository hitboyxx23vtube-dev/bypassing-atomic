document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("commandInput");
  const output = document.getElementById("output");

  let globalVolume = 50;
  let currentMedia = null;
  let customCommands = {};
  let konochiActive = false;

  const aliasMap = { cls: "clear", cmds: "help" };
  const konamiCode = [38,38,40,40,37,39,37,39,66,65];
  let konamiIndex = 0;

  // Fixed AI identity
  const aiIdentity = { name: "Luna", age: 19, gender: "female" };
  let additionalSystemPrompt = ""; // extra instructions for Luna

  window.addEventListener("keydown", (e) => {
    const key = e.keyCode || e.which;
    if(key === konamiCode[konamiIndex]){
      konamiIndex++;
      if(konamiIndex === konamiCode.length){
        activateKonochiMode();
        konamiIndex = 0;
      }
    } else konamiIndex = 0;
  });

  input.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      const command = input.value.trim();
      if(command !== ""){
        output.innerHTML += `<div class="command">> ${command}</div>`;
        handleCommand(command);
        input.value = "";
        output.scrollTop = output.scrollHeight;
      }
    }
  });

  function typeLine(text){
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function stopMedia(){
    if(currentMedia){
      if(typeof currentMedia.pause === "function") currentMedia.pause();
      if(typeof currentMedia.remove === "function") currentMedia.remove();
      currentMedia = null;
    }
  }

  function playVideo(url){
    stopMedia();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    const container = document.createElement("div");
    container.style.marginTop = "10px";

    if(youtubeRegex.test(url)){
      const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match ? match[1] : null;
      if(!videoId){ typeLine("⚠️ Invalid YouTube URL."); return; }
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
      iframe.width="100%"; iframe.height="360";
      iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen=true; iframe.style.border="none";
      container.appendChild(iframe);
      currentMedia = iframe;
    } else {
      const video = document.createElement("video");
      video.src = url; video.controls=true; video.autoplay=true;
      video.volume = globalVolume / 100;
      video.style.width="100%"; video.style.maxHeight="360px";
      container.appendChild(video);
      currentMedia = video;
    }

    typeLine(`▶️ Playing video: ${url}`);
    output.appendChild(container);
  }

  function playMusic(url){
    stopMedia();
    const audio = document.createElement("audio");
    audio.src=url; audio.controls=true; audio.autoplay=true;
    audio.volume = globalVolume/100; audio.style.width="100%";
    currentMedia = audio; output.appendChild(audio);
    typeLine(`🎵 Playing music: ${url}`);
  }

  function activateKonochiMode(){
    if(!konochiActive){
      konochiActive=true;
      typeLine("🎮 Konochi Mode Activated! Use 'konochi off' to deactivate.");
      document.body.style.backgroundColor="#111";
      document.body.style.color="#0ff";
      document.title="KONOCHI MODE 💮";
    }
  }

  function deactivateKonochiModeAndReload(){
    typeLine("🛑 Konochi Mode Deactivated. Reloading...");
    setTimeout(()=>location.reload(),1000);
  }

  function extractTextFromResponse(data) {
    if (!data?.choices) return "No content generated.";
    let result = "";
    data.choices.forEach(choice => {
      const msg = choice.message;
      if (msg?.content) {
        if (Array.isArray(msg.content)) msg.content.forEach(part => result += part.text || part);
        else result += msg.content;
      }
    });
    return result || "No content generated.";
  }

  async function callVoidAI(prompt){
    const thinkingLine = document.createElement("div");
    thinkingLine.textContent = "🤖 Luna is thinking...";
    output.appendChild(thinkingLine);
    output.scrollTop = output.scrollHeight;

    const url = "https://api.voidai.app/v1/chat/completions";
    const apiKey = "sk-voidai-USDeNw6e54sgpdk4FG3ZZVpiJIeLfKnWAIzuIhdoTHatGC5uij96WYE21f9SICzhSJ6VL8pchtcnP5zcdTDh8mpb0txf5KFZBAeT"; // replace with your key

    // Combine fixed identity + extra system prompt
    const systemPrompt = `You are ${aiIdentity.name}, a ${aiIdentity.age}-year-old ${aiIdentity.gender}. Respond in short, simple answers, keeping your identity consistent.` +
                         (additionalSystemPrompt ? " " + additionalSystemPrompt : "");

    const body = {
      model: "magistral-small-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      thinkingLine.remove();

      if (!response.ok) {
        typeLine(`❌ AI error: ${data?.error?.message || response.statusText}`);
        return;
      }

      let text = extractTextFromResponse(data);
      typeLine(text);
    } catch (err) {
      thinkingLine.remove();
      typeLine(`Fetch error: ${err.message}`);
    }
  }

  function handleCommand(cmd){
    if(!cmd||cmd.trim()==="") return;
    const parts=cmd.trim().split(/\s+/);
    const baseCmd=parts[0].toLowerCase();
    const commandKey = aliasMap[baseCmd]||baseCmd;

    switch(commandKey){
      case "help":
        typeLine("Available commands:");
        typeLine("- help (cmds) : Show this help message");
        typeLine("- clear (cls) : Clear the terminal output");
        typeLine("- playvideo [url] : Play a YouTube or video URL");
        typeLine("- playmusic [url] : Play audio/music URL");
        typeLine("- stop : Stop current media");
        typeLine("- volume [0-100] : Set volume");
        typeLine("- addcmd [name] [response] : Add a custom command");
        typeLine("- voidai {prompt} : Ask Luna");
        typeLine("- setprompt {text} : Set additional system prompt for Luna");
        Object.keys(customCommands).forEach(c=>typeLine(`- ${c}`));
        break;
      case "clear": output.textContent=""; break;
      case "playvideo": if(parts.length<2) return typeLine("Usage: playvideo [url]"); playVideo(parts.slice(1).join(" ")); break;
      case "playmusic": if(parts.length<2) return typeLine("Usage: playmusic [url]"); playMusic(parts.slice(1).join(" ")); break;
      case "stop": stopMedia(); typeLine("⏹️ Media stopped."); break;
      case "volume": 
        if(parts.length<2||isNaN(parts[1])) return typeLine("Usage: volume [0-100]");
        globalVolume=Math.max(0,Math.min(100,parseInt(parts[1])));
        if(currentMedia&&"volume" in currentMedia) currentMedia.volume=globalVolume/100;
        typeLine(`🔊 Volume set to ${globalVolume}`); break;
      case "addcmd":
        if(parts.length<3) return typeLine("Usage: addcmd [name] [response]");
        customCommands[parts[1].toLowerCase()]=parts.slice(2).join(" ");
        typeLine(`✅ Command '${parts[1]}' added.`); break;
      case "setprompt":
        if(parts.length<2) return typeLine("Usage: setprompt {text}");
        additionalSystemPrompt = parts.slice(1).join(" ");
        typeLine("✅ Additional system prompt set.");
        break;
      case "konochi":
        if(parts[1]&&parts[1].toLowerCase()==="off") deactivateKonochiModeAndReload();
        else if(!konochiActive) activateKonochiMode();
        else typeLine("Konochi Mode is already active. Use 'konochi off' to deactivate."); break;
      case "voidai": if(parts.length<2) return typeLine("Usage: voidai {prompt}"); callVoidAI(cmd.slice(7).trim()); break;
      default:
        if(customCommands[commandKey]) typeLine(customCommands[commandKey]);
        else typeLine(`❓ Unknown command: ${commandKey}`);
    }
  }

  // Show Luna join message once
  typeLine(`🤖 ${aiIdentity.name} has joined the chat! (${aiIdentity.age} years old, ${aiIdentity.gender})`);
});
