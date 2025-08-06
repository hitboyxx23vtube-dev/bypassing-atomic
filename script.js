const output = document.getElementById("output");
const input = document.getElementById("input");
const terminal = document.getElementById("terminal");

input.focus();

let history = [];
let historyIndex = 0;
let currentMedia = null;
let globalVolume = 50;

// Helper to focus input and place caret at the end
function focusInput() {
  input.focus();
  // Move caret to the end
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(input);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

// Typing effect that appends lines
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

// AI call to Google Gemini API
async function callAI(prompt) {
  const apiKey = 'AIzaSyCTEJO-_5AtzH50CWRO6p-5vDJ5RbmJ1V0'; // Replace with your API key
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      await typeLine(`AI API error: ${errorText}`);
      return;
    }

    const data = await response.json();

    const generatedText = data?.candidates?.[0]?.content || "No content generated.";

    await typeLine(generatedText);

  } catch (err) {
    await typeLine(`Fetch error: ${err.message}`);
  }
}

// Command handler
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
- ai {prompt}: ask AI to generate content`);
      break;

    case "status":
      await typeLine("Bypassing... 🔐\nStatus: ATOMIC CORE BREACHED\nEncryption Layers: 0/7");
      break;

    case "clear":
      output.innerHTML = "";
      break;

    case "ai":
      if (parts.length < 2) {
        await typeLine("Usage: ai {prompt}");
      } else {
        const prompt = cmd.slice(3).trim();
        await callAI(prompt);
      }
      break;

    default:
      await typeLine("Unknown command. Type 'help' for options.");
  }
}

// Listen for keydown on input for Enter & history navigation
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const cmd = input.textContent.trim();
    if (cmd) {
      history.push(cmd);
      historyIndex = history.length;
      handleCommand(cmd).then(() => {
        focusInput();
      });
      input.textContent = "";
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.textContent = history[historyIndex];
      focusInput();
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.textContent = history[historyIndex];
    } else {
      historyIndex = history.length;
      input.textContent = "";
    }
    focusInput();
  }
});

// Focus input on load
window.onload = () => {
  focusInput();
};
