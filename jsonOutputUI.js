// jsonOutputUI.js - Handles the JSON output section UI and editing visuals

import * as state from "./state.js";
import * as dom from "./domElements.js";
import { setChatInputEnabled } from "./chatInputUI.js";
import { formatMessages } from "./formatter.js"; // Import the formatter

// --- Core UI Functions ---

export function updateJsonlOutput() {
  if (state.isEditingJson) return;

  // Get filtered messages
  const filteredMessages = state.getFilteredMessagesForJson();

  // Format messages using the current template
  const formattedString = formatMessages(
    filteredMessages,
    state.currentFormatTemplate
  );

  // Update the code display
  dom.jsonlOutputCode.textContent = formattedString;

  // Update the title
  dom.outputTitle.textContent = `${state.currentFormatTemplate.formatName} Output`;

  // Generate Line Numbers based on the formatted string
  generateLineNumbers(formattedString);

  // Enable/disable edit button based on the selected format's editability
  dom.editJsonButton.disabled = !state.currentFormatTemplate.isEditable;
  dom.editJsonButton.style.cursor = state.currentFormatTemplate.isEditable
    ? "pointer"
    : "not-allowed";
  dom.editJsonButton.style.opacity = state.currentFormatTemplate.isEditable
    ? "1"
    : "0.5";
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

// setJsonEditable remains mostly the same, but respects editability flag
export function setJsonEditable(editable) {
  // Only allow entering edit mode if the current format is editable
  if (editable && !state.currentFormatTemplate.isEditable) {
    console.warn("Editing is not supported for the current format.");
    return;
  }

  state.setEditingJson(editable); // Update state

  if (editable) {
    dom.jsonlOutputPre.contentEditable = "true";
    dom.jsonlOutputPre.focus();
    dom.saveJsonButton.classList.remove("hidden");
    dom.cancelJsonButton.classList.remove("hidden");
    dom.jsonlOutputPre.classList.add("ring-2", "ring-ring", "bg-background");
    dom.lineNumbersDiv.classList.add("opacity-70");
    setChatInputEnabled(false);
  } else {
    dom.jsonlOutputPre.contentEditable = "false";
    dom.saveJsonButton.classList.add("hidden");
    dom.cancelJsonButton.classList.add("hidden");
    dom.jsonlOutputPre.classList.remove("ring-2", "ring-ring", "bg-background");
    dom.lineNumbersDiv.classList.remove("opacity-70");
    setChatInputEnabled(true);
    // Update display based on current state.messages and current template
    updateJsonlOutput();
  }
}

// --- Indentation Logic ---
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
  }
}

function handleTabIndent(range) {
  document.execCommand("insertText", false, state.indentSpaces);
}

function handleShiftTabOutdent(range) {
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const textContent = startContainer.textContent;
    let lineStartOffset = textContent.lastIndexOf("\n", startOffset - 1) + 1;
    if (
      textContent.substring(
        lineStartOffset,
        lineStartOffset + state.indentSpaces.length
      ) === state.indentSpaces
    ) {
      const outdentRange = document.createRange();
      outdentRange.setStart(startContainer, lineStartOffset);
      outdentRange.setEnd(
        startContainer,
        lineStartOffset + state.indentSpaces.length
      );
      if (startOffset >= lineStartOffset + state.indentSpaces.length) {
        outdentRange.deleteContents();
      }
    }
  }
}
