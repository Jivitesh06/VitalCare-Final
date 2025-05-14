const prompt = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector("#chatBody");

// Replace with your actual Gemini API key
const API_KEY = "AIzaSyDhrUMiFxguqs-qGg7DzNrDZhpKQOJmB-M";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDhrUMiFxguqs-qGg7DzNrDZhpKQOJmB-M";

async function generateResponse(userMessage) {
  const aiMsg = document.createElement("div");
  aiMsg.classList.add("chat-message", "bot");
  aiMsg.innerHTML = "Thinking...";
  chatContainer.appendChild(aiMsg);

  const requestPayload = {
    contents: [{ parts: [{ text: userMessage }] }]
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    aiMsg.innerHTML = responseText.replace(/\n/g, "<br>");
  } catch (err) {
    console.error(err);
    aiMsg.innerHTML = "Error: Unable to reach the AI.";
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendUserMessage(message) {
  const userMsg = document.createElement("div");
  userMsg.classList.add("chat-message", "user");
  userMsg.textContent = message;
  chatContainer.appendChild(userMsg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

submitBtn.addEventListener("click", () => {
  const message = prompt.value.trim();
  if (!message) return;
  appendUserMessage(message);
  generateResponse(message);
  prompt.value = "";
});

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitBtn.click();
});
