const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const savedFilesList = document.getElementById("saved-files-list");
const fileIcon = document.querySelector(".file-icon");

let conversation = [];

// Typing effect for AI responses
function typeMessage(message, element) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < message.length) {
      element.textContent += message[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
}

// Add a message to the chat log
function addMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", role);
  chatLog.appendChild(messageDiv);
  if (role === "assistant") {
    typeMessage(content, messageDiv);
  } else {
    messageDiv.textContent = content;
  }
  chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to bottom
}

// Send user message to the API
async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  userInput.value = "";

  const data = JSON.stringify({
    messages: conversation.concat({ role: "user", content: userMessage }),
    web_access: false,
  });

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      const response = JSON.parse(this.responseText);
      if (response.result) {
        addMessage("assistant", response.result);
        conversation.push({ role: "user", content: userMessage });
        conversation.push({ role: "assistant", content: response.result });
      } else {
        addMessage("assistant", "Unexpected response format.");
      }
    }
  });

  xhr.open("POST", "https://chatgpt-42.p.rapidapi.com/o3mini");
  xhr.setRequestHeader("x-rapidapi-key", "fd9f274d1dmshcfa8a46f7b1a7dep115304jsnf8b7056b6254");
  xhr.setRequestHeader("x-rapidapi-host", "chatgpt-42.p.rapidapi.com");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
}

// Save conversation to localStorage
function saveConversation() {
  const saveName = prompt("Enter a name for the conversation:");
  if (!saveName) return;

  const existingConversations = JSON.parse(localStorage.getItem("chatbot-conversations")) || {};
  if (existingConversations[saveName]) {
    const override = confirm("This conversation already exists. Override it?");
    if (!override) return;
  }

  existingConversations[saveName] = conversation;
  localStorage.setItem("chatbot-conversations", JSON.stringify(existingConversations));
  alert("Conversation saved!");
  updateSavedFilesList();
}

// Load conversation from localStorage
function loadConversation(saveName) {
  const existingConversations = JSON.parse(localStorage.getItem("chatbot-conversations")) || {};
  if (!existingConversations[saveName]) {
    alert("Invalid conversation name.");
    return;
  }

  conversation = existingConversations[saveName];
  chatLog.innerHTML = ""; // Clear chat log
  conversation.forEach((msg) => addMessage(msg.role, msg.content));
}

// Update the list of saved files
function updateSavedFilesList() {
  const existingConversations = JSON.parse(localStorage.getItem("chatbot-conversations")) || {};
  savedFilesList.innerHTML = Object.keys(existingConversations)
    .map((name) => `<li onclick="loadConversation('${name}')">${name}</li>`)
    .join("");
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
saveBtn.addEventListener("click", saveConversation);
loadBtn.addEventListener("click", () => {
  const saveName = prompt("Enter the name of the conversation to load:");
  if (saveName) loadConversation(saveName);
});
fileIcon.addEventListener("mouseenter", () => {
  document.querySelector(".saved-files").classList.remove("hidden");
  updateSavedFilesList();
});
fileIcon.addEventListener("mouseleave", () => {
  document.querySelector(".saved-files").classList.add("hidden");
});

// Initialize
updateSavedFilesList();
