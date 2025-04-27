// main.js - Application entry point

import { rebuildChatUI } from "./chatInputUI.js";
import { updateJsonlOutput } from "./jsonOutputUI.js";
import { attachAllListeners } from "./eventListeners.js";

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing application...");
  rebuildChatUI(); // Build initial chat UI (adds first empty pair)
  updateJsonlOutput(); // Generate initial JSON output and line numbers
  attachAllListeners(); // Attach all event listeners
  console.log("Application initialized.");
});
