// chatInputUI.js - Handles the chat input section UI

import * as state from "./state.js";
import * as dom from "./domElements.js";
import { updateJsonlOutput } from "./jsonOutputUI.js"; // Import for updates

// --- Core UI Functions ---

export function createMessageElements(
  index,
  userData = "",
  assistantData = ""
) {
  const pairDiv = document.createElement("div");
  pairDiv.className =
    "message-pair p-4 border border-border rounded-md bg-card shadow-sm";
  pairDiv.dataset.index = index;

  // User Input
  const userDiv = document.createElement("div");
  const userLabel = document.createElement("label");
  userLabel.htmlFor = `user-${index}`;
  userLabel.className = "block text-sm font-medium mb-1 text-foreground";
  userLabel.textContent = `User ${index + 1}`;
  const userInput = document.createElement("textarea");
  userInput.id = `user-${index}`;
  userInput.dataset.role = "user";
  userInput.dataset.index = index;
  userInput.placeholder = "Enter user message...";
  userInput.rows = 3;
  userInput.value = userData;
  userInput.className =
    "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  userDiv.appendChild(userLabel);
  userDiv.appendChild(userInput);

  // Assistant Input
  const assistantDiv = document.createElement("div");
  const assistantLabel = document.createElement("label");
  assistantLabel.htmlFor = `assistant-${index}`;
  assistantLabel.className = "block text-sm font-medium mb-1 text-foreground";
  assistantLabel.textContent = `Assistant ${index + 1}`;
  const assistantInput = document.createElement("textarea");
  assistantInput.id = `assistant-${index}`;
  assistantInput.dataset.role = "assistant";
  assistantInput.dataset.index = index;
  assistantInput.placeholder = "Enter assistant response...";
  assistantInput.rows = 3;
  assistantInput.value = assistantData;
  assistantInput.className =
    "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  assistantDiv.appendChild(assistantLabel);
  assistantDiv.appendChild(assistantInput);

  pairDiv.appendChild(userDiv);
  pairDiv.appendChild(assistantDiv);

  return pairDiv;
}

export function rebuildChatUI() {
  dom.chatContainer.innerHTML = ""; // Clear existing UI
  const numPairs = Math.ceil(state.messages.length / 2);

  for (let i = 0; i < numPairs; i++) {
    const userMsg = state.messages[i * 2]?.content || "";
    const assistantMsg = state.messages[i * 2 + 1]?.content || "";
    const messageElements = createMessageElements(i, userMsg, assistantMsg);
    dom.chatContainer.appendChild(messageElements);
  }

  // Add one starting/extra empty pair (UI + data) if needed
  if (
    state.messages.length === 0 ||
    state.messages[state.messages.length - 1]?.content
  ) {
    addMessagePair(); // Add UI and data placeholders
  }
}

// Adds both UI elements and data placeholders
export function addMessagePair() {
  const newIndex = Math.floor(state.messages.length / 2);

  // Add placeholders to the messages array in state.js
  if (state.messages.length % 2 !== 0) {
    state.addMessage({ role: "assistant", content: "" });
    const correctedIndex = Math.floor(state.messages.length / 2);
    if (correctedIndex === newIndex) {
      state.addMessage({ role: "user", content: "" });
      state.addMessage({ role: "assistant", content: "" });
    }
  } else {
    state.addMessage({ role: "user", content: "" });
    state.addMessage({ role: "assistant", content: "" });
  }

  // Create and append the UI elements for the actual newIndex
  const messageElements = createMessageElements(newIndex);
  dom.chatContainer.appendChild(messageElements);
}

export function setChatInputEnabled(enabled) {
  const textareas = dom.chatContainer.querySelectorAll("textarea");
  if (enabled) {
    dom.chatContainer.classList.remove("disabled");
    textareas.forEach((ta) => (ta.disabled = false));
  } else {
    dom.chatContainer.classList.add("disabled");
    textareas.forEach((ta) => (ta.disabled = true));
  }
}
