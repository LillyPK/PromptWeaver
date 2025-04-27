// jsonOutputUI.js - Handles the JSON output section UI and editing visuals

import * as state from "./state.js";
import * as dom from "./domElements.js";
import { setChatInputEnabled } from "./chatInputUI.js"; // To disable/enable chat input

// --- Core UI Functions ---

export function updateJsonlOutput() {
  if (state.isEditingJson) return; // Don't update while actively editing

  // Get filtered messages using the helper function
  const filteredMessages = state.getFilteredMessagesForJson();

  const jsonlData = {
    messages: filteredMessages,
  };

  // Pretty print the JSON for DISPLAY using 2 spaces
  const jsonString = JSON.stringify(jsonlData, null, 2); // Explicitly 2 spaces
  dom.jsonlOutputCode.textContent = jsonString;

  // Generate Line Numbers
  generateLineNumbers(jsonString);
}

// generateLineNumbers remains the same...
function generateLineNumbers(jsonString) {
  const lines = jsonString.split("\n");
  const lineCount = jsonString === "" ? 0 : lines.length;
  dom.lineNumbersDiv.innerHTML = ""; // Clear previous numbers

  for (let i = 1; i <= lineCount; i++) {
    const numberDiv = document.createElement("div");
    numberDiv.textContent = i;
    dom.lineNumbersDiv.appendChild(numberDiv);
  }
  // Add extra space for cursor if ending with newline
  if (jsonString.endsWith("\n") && lineCount > 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.innerHTML = "&nbsp;";
    dom.lineNumbersDiv.appendChild(emptyDiv);
  }
}

// setJsonEditable remains the same...
export function setJsonEditable(editable) {
  state.setEditingJson(editable); // Update state

  if (editable) {
    dom.jsonlOutputPre.contentEditable = "true";
    dom.jsonlOutputPre.focus();
    dom.saveJsonButton.classList.remove("hidden");
    dom.cancelJsonButton.classList.remove("hidden");
    dom.jsonlOutputPre.classList.add("ring-2", "ring-ring", "bg-background");
    dom.lineNumbersDiv.classList.add("opacity-70");
    setChatInputEnabled(false); // Disable chat input
  } else {
    dom.jsonlOutputPre.contentEditable = "false";
    dom.saveJsonButton.classList.add("hidden");
    dom.cancelJsonButton.classList.add("hidden");
    dom.jsonlOutputPre.classList.remove("ring-2", "ring-ring", "bg-background");
    dom.lineNumbersDiv.classList.remove("opacity-70");
    setChatInputEnabled(true); // Enable chat input
    // Update JSON/line numbers based on the current state.messages
    // This reverts visual changes if "Cancel" was clicked.
    updateJsonlOutput();
  }
}

// --- Indentation Logic --- (Called by event listener)
// handleTabIndentation, handleTabIndent, handleShiftTabOutdent remain the same...
export function handleTabIndentation(event) {
  event.preventDefault(); // Prevent default focus change

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  if (range.collapsed) {
    if (event.shiftKey) {
      handleShiftTabOutdent(range);
    } else {
      handleTabIndent(range);
    }
  } else {
    // Multi-line selection handling (basic example or placeholder)
    console.log("Tab/Shift+Tab on selection not fully implemented.");
    // For a basic implementation, you might just indent/outdent the first line
    // or apply it naively which might break JSON structure.
    // A robust solution requires parsing lines within the selection.
  }
}

function handleTabIndent(range) {
  // Use execCommand for simplicity in inserting text at the cursor
  // Uses state.indentSpaces ("  ") for manual tabbing consistency
  document.execCommand("insertText", false, state.indentSpaces);
}

function handleShiftTabOutdent(range) {
  const { startContainer, startOffset } = range;

  // Check if the cursor is within a text node
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const textContent = startContainer.textContent;
    // Find the start of the current line
    let lineStartOffset = textContent.lastIndexOf("\n", startOffset - 1) + 1;

    // Check if the line starts with the indent spaces
    if (
      textContent.substring(
        lineStartOffset,
        lineStartOffset + state.indentSpaces.length
      ) === state.indentSpaces
    ) {
      // Create a range covering the indent spaces to remove
      const outdentRange = document.createRange();
      outdentRange.setStart(startContainer, lineStartOffset);
      outdentRange.setEnd(
        startContainer,
        lineStartOffset + state.indentSpaces.length
      );

      // Check if the cursor is *after* the indent before deleting
      // This prevents deleting if the cursor is within the indent itself
      if (startOffset >= lineStartOffset + state.indentSpaces.length) {
        outdentRange.deleteContents(); // Remove the spaces
      }
    }
    // If not indented, do nothing for Shift+Tab
  }
}
