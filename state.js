// state.js - Manages application state

export let messages = []; // Array to hold message data { role: 'user'/'assistant', content: '' }
export let isEditingJson = false;
export const indentSpaces = "  "; // Define indentation spaces for manual Tab key

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
    return true; // Indicate success
  }
  return false; // Indicate failure (index out of bounds)
}

export function setEditingJson(isEditing) {
  isEditingJson = isEditing;
}

// --- Helper Function ---
/**
 * Filters the messages array to remove empty ones,
 * suitable for JSON output.
 * @returns {Array} The filtered array of message objects.
 */
export function getFilteredMessagesForJson() {
  return messages.filter((msg) => {
    return msg.content.trim() !== "";
  });
}
