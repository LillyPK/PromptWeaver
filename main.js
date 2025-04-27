// main.js - Application entry point

import * as dom from "./domElements.js"; // Import dom elements
import { formatTemplates, defaultFormatName } from "./templates.js"; // Import templates
import { rebuildChatUI } from "./chatInputUI.js";
import { updateJsonlOutput } from "./jsonOutputUI.js";
import { attachAllListeners } from "./eventListeners.js";

// --- Initialization ---

function populateFormatSelector() {
  for (const formatName in formatTemplates) {
    const option = document.createElement("option");
    option.value = formatName;
    option.textContent = formatName;
    if (formatName === defaultFormatName) {
      option.selected = true; // Set default selection
    }
    dom.formatSelector.appendChild(option);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing application...");
  populateFormatSelector(); // Populate the dropdown
  rebuildChatUI(); // Build initial chat UI
  updateJsonlOutput(); // Generate initial output and line numbers
  attachAllListeners(); // Attach all event listeners
  console.log("Application initialized.");
});
