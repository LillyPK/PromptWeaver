// eventListeners.js - Attaches event listeners and handles interactions

import * as state from "./state.js";
import * as dom from "./domElements.js";
import {
  addMessagePair,
  rebuildChatUI,
  setChatInputEnabled,
} from "./chatInputUI.js";
import {
  updateJsonlOutput,
  setJsonEditable,
  handleTabIndentation,
} from "./jsonOutputUI.js";

export function attachAllListeners() {
  // --- Chat Input Listener ---
  dom.chatContainer.addEventListener("input", handleChatInput);

  // --- JSON Output Area Listeners ---
  dom.jsonOutputContainer.addEventListener("click", handleJsonContainerClick);
  dom.jsonlOutputPre.addEventListener("keydown", handleJsonKeyDown); // Tab handling

  // --- Context Menu Button Listeners ---
  dom.copyJsonButton.addEventListener("click", handleCopyJson); // Modified below
  dom.editJsonButton.addEventListener("click", handleEditJson);

  // --- Edit Mode Button Listeners ---
  dom.saveJsonButton.addEventListener("click", handleSaveJson);
  dom.cancelJsonButton.addEventListener("click", handleCancelJson);

  // --- Global Click Listener (for hiding context menu) ---
  document.addEventListener("click", handleGlobalClick);
}

// --- Handler Functions ---

// handleChatInput remains the same...
function handleChatInput(event) {
  if (event.target.tagName === "TEXTAREA") {
    const textarea = event.target;
    const index = parseInt(textarea.dataset.index, 10);
    const role = textarea.dataset.role;
    const content = textarea.value;
    const messageArrayIndex = role === "user" ? index * 2 : index * 2 + 1;

    // Get current content before update for wasEmpty check
    const wasEmpty = state.messages[messageArrayIndex]?.content === "";

    // Update message content in state
    const updated = state.updateMessageContent(messageArrayIndex, content);

    if (updated) {
      updateJsonlOutput(); // Update JSON display

      // Check if we need to add a new pair
      const isNowNotEmpty = content.trim() !== "";
      const currentLastPairIndex = Math.floor((state.messages.length - 1) / 2);

      if (index === currentLastPairIndex && wasEmpty && isNowNotEmpty) {
        addMessagePair(); // Add the next pair (UI + data)
      }
    } else {
      console.error("State mismatch: Failed to update message content.", {
        index,
        role,
        messageArrayIndex,
        messagesLength: state.messages.length,
      });
    }
  }
}

// handleJsonContainerClick remains the same...
function handleJsonContainerClick(event) {
  const isClickOnMenu = dom.jsonContextMenu.contains(event.target);
  if (!state.isEditingJson && !isClickOnMenu) {
    dom.jsonContextMenu.classList.add("hidden"); // Hide first
    const rect = dom.jsonOutputContainer.getBoundingClientRect();
    const x =
      event.pageX -
      rect.left -
      window.scrollX +
      dom.jsonOutputContainer.scrollLeft;
    const y =
      event.pageY -
      rect.top -
      window.scrollY +
      dom.jsonOutputContainer.scrollTop;
    dom.jsonContextMenu.style.left = `${x}px`;
    dom.jsonContextMenu.style.top = `${y}px`;
    dom.jsonContextMenu.classList.remove("hidden");
  }
}

// handleJsonKeyDown remains the same...
function handleJsonKeyDown(event) {
  if (state.isEditingJson && event.key === "Tab") {
    handleTabIndentation(event); // Delegate to function in jsonOutputUI
  }
}

// Modified: handleCopyJson
function handleCopyJson() {
  // Get the filtered data using the helper
  const filteredMessages = state.getFilteredMessagesForJson();
  const jsonlData = {
    messages: filteredMessages,
  };

  // Generate the string specifically for copying with 4 spaces
  const stringToCopy = JSON.stringify(jsonlData, null, 4); // Explicitly 4 spaces

  // Copy the 4-space indented string to the clipboard
  navigator.clipboard
    .writeText(stringToCopy)
    .then(() => {
      dom.copyJsonButton.textContent = "Copied!";
      setTimeout(() => {
        dom.copyJsonButton.textContent = "Copy";
        dom.jsonContextMenu.classList.add("hidden");
      }, 1000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
      dom.jsonContextMenu.classList.add("hidden");
    });
}

// handleEditJson remains the same...
function handleEditJson() {
  setJsonEditable(true); // Enable edit mode visuals and state
  dom.jsonContextMenu.classList.add("hidden");
}

// handleSaveJson remains the same...
function handleSaveJson() {
  const editedText = dom.jsonlOutputPre.textContent;
  try {
    const parsedData = JSON.parse(editedText);
    if (!parsedData || !Array.isArray(parsedData.messages)) {
      throw new Error("Invalid JSON structure: Missing 'messages' array.");
    }
    state.setMessages(parsedData.messages); // Commit changes to state
    rebuildChatUI(); // Rebuild chat UI based on new state
    setJsonEditable(false); // Exit edit mode (this calls updateJsonlOutput)
  } catch (error) {
    console.error("Invalid JSON:", error);
    alert(
      `Invalid JSON format: ${error.message}\nPlease correct it and try saving again.`
    );
    dom.jsonlOutputPre.focus(); // Keep focus for correction
  }
}

// handleCancelJson remains the same...
function handleCancelJson() {
  // Discard edits by simply exiting edit mode.
  // setJsonEditable calls updateJsonlOutput, which uses the *unchanged* state.messages.
  setJsonEditable(false);
}

// handleGlobalClick remains the same...
function handleGlobalClick(event) {
  const isClickOutsideContainer = !dom.jsonOutputContainer.contains(
    event.target
  );
  const isClickOutsideMenu = !dom.jsonContextMenu.contains(event.target);
  if (isClickOutsideContainer && isClickOutsideMenu) {
    dom.jsonContextMenu.classList.add("hidden");
  }
}
