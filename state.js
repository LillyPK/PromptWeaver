// state.js - Manages application state
import { formatTemplates, defaultFormatName } from "./templates.js";

export let messages = [];
export let isEditingJson = false;
export const indentSpaces = "  "; // For manual Tab key

// Add state for current format
export let currentFormatTemplate = formatTemplates[defaultFormatName];

// --- State Modifiers ---
export function setMessages(newMessages) {
  messages = newMessages;
}

export function addMessage(message) {
  messages.push(message);
}

export function updateMessageContent(index, content) {
  if (index >= 0 && index < messages.length) {
    messages[index].content = content;
    return true;
  }
  return false;
}

export function setEditingJson(isEditing) {
  isEditingJson = isEditing;
}

// Function to update the current format template
export function setCurrentFormatTemplate(template) {
  currentFormatTemplate = template;
}

// --- Helper Function ---
export function getFilteredMessagesForJson() {
  // Filter out messages that are truly empty
  return messages.filter((msg) => {
    return msg.content.trim() !== "";
  });
}
