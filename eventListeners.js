// eventListeners.js - Attaches event listeners and handles interactions

import * as state from "./state.js";
import * as dom from "./domElements.js";
import { formatTemplates } from "./templates.js"; // Import templates for lookup
import { formatMessages } from "./formatter.js"; // Import formatter
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
  dom.jsonlOutputPre.addEventListener("keydown", handleJsonKeyDown);

  // --- Context Menu Button Listeners ---
  dom.copyJsonButton.addEventListener("click", handleCopy); // Renamed
  dom.editJsonButton.addEventListener("click", handleEditJson);

  // --- Edit Mode Button Listeners ---
  dom.saveJsonButton.addEventListener("click", handleSaveJson);
  dom.cancelJsonButton.addEventListener("click", handleCancelJson);

  // --- Format Selector Listener ---
  dom.formatSelector.addEventListener("change", handleFormatChange); // Added

  // --- Global Click Listener ---
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
    const wasEmpty = state.messages[messageArrayIndex]?.content === "";
    const updated = state.updateMessageContent(messageArrayIndex, content);

    if (updated) {
      updateJsonlOutput();
      const isNowNotEmpty = content.trim() !== "";
      const currentLastPairIndex = Math.floor((state.messages.length - 1) / 2);
      if (index === currentLastPairIndex && wasEmpty && isNowNotEmpty) {
        addMessagePair();
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
  // Only show menu if not editing AND the format is editable OR if clicking copy
  // Let's simplify: always show menu, but edit button is disabled visually/functionally elsewhere
  if (!state.isEditingJson && !isClickOnMenu) {
    dom.jsonContextMenu.classList.add("hidden");
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
  // Indentation only works if editing is allowed for the format
  if (
    state.isEditingJson &&
    state.currentFormatTemplate.isEditable &&
    event.key === "Tab"
  ) {
    handleTabIndentation(event);
  } else if (
    event.key === "Tab" &&
    state.isEditingJson &&
    !state.currentFormatTemplate.isEditable
  ) {
    // Prevent tab focus change even if not indenting for non-editable formats
    event.preventDefault();
    console.log("Tab disabled for non-editable format during edit.");
  }
}

// Modified: handleCopy (was handleCopyJson)
function handleCopy() {
  const filteredMessages = state.getFilteredMessagesForJson();
  const currentTemplate = state.currentFormatTemplate;
  let stringToCopy = "";

  // Check if special copy indent level is defined (like for JSON 4-space)
  if (currentTemplate.copyIndent !== null) {
    const jsonData = { messages: filteredMessages };
    stringToCopy = JSON.stringify(jsonData, null, currentTemplate.copyIndent);
  } else {
    // Otherwise, format using the standard template rules
    stringToCopy = formatMessages(filteredMessages, currentTemplate);
  }

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

// Modified: handleEditJson respects editability
function handleEditJson() {
  if (!state.currentFormatTemplate.isEditable) {
    alert(
      `Editing is only supported for the JSON format currently. Please switch format to edit.`
    );
    dom.jsonContextMenu.classList.add("hidden");
    return;
  }
  setJsonEditable(true); // Enable edit mode visuals and state
  dom.jsonContextMenu.classList.add("hidden");
}

// Modified: handleSaveJson assumes saved text must be JSON
function handleSaveJson() {
  // Saving always assumes the edited content should be parsed as JSON
  // because that's our internal data structure.
  if (state.currentFormatTemplate.formatName !== "JSON") {
    alert("Saving changes requires the format to be set back to JSON.");
    // Optionally, automatically switch back? For now, just alert.
    // state.setCurrentFormatTemplate(formatTemplates.JSON);
    // dom.formatSelector.value = "JSON";
    // updateJsonlOutput(); // Refresh display to show JSON before potential save attempt
    return;
  }

  const editedText = dom.jsonlOutputPre.textContent;
  try {
    const parsedData = JSON.parse(editedText); // Attempt to parse as JSON
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
  setJsonEditable(false);
}

// Added: handleFormatChange
function handleFormatChange(event) {
  const selectedFormatName = event.target.value;
  const newTemplate = formatTemplates[selectedFormatName];
  if (newTemplate) {
    state.setCurrentFormatTemplate(newTemplate); // Update state
    updateJsonlOutput(); // Re-render output with new format
  } else {
    console.error("Selected format template not found:", selectedFormatName);
  }
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
