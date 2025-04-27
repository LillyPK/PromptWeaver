// formatter.js - Handles formatting messages based on templates

import * as state from "./state.js"; // Access current template if needed, though passed as arg

// Basic escaping functions (can be expanded)
function escapeJsonString(str) {
  // Simple escaping for JSON strings
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t") // Escape tabs
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, (char) => {
      // Escape control characters
      const hex = char.charCodeAt(0).toString(16);
      return "\\u" + "0000".substring(hex.length) + hex;
    });
}

function escapeYamlString(str) {
  // Basic YAML escaping (using quotes handles most cases)
  // More complex multi-line handling might be needed for perfect YAML
  return escapeJsonString(str); // Reuse JSON escaping for content within quotes
}

/**
 * Formats messages based on the provided template.
 * @param {Array} messagesToFormat - Array of message objects {role, content}.
 * @param {object} template - The format descriptor template object.
 * @returns {string} The formatted output string.
 */
export function formatMessages(messagesToFormat, template) {
  let output = template.wrapper.start;
  const numMessages = messagesToFormat.length;

  messagesToFormat.forEach((message, index) => {
    const messageTemplate = template.messageTemplates[message.role];

    // Skip if role not defined in template (or handle default)
    if (!messageTemplate) {
      console.warn(
        `Role "${message.role}" not found in template "${template.formatName}". Skipping message.`
      );
      return; // Continue to next message
    }

    let content = message.content;

    // Apply escaping based on template type
    switch (template.escapeType) {
      case "json":
        content = escapeJsonString(content);
        break;
      case "yaml":
        // Using quotes in the template prefix/suffix handles many cases.
        // If not using quotes, more complex YAML escaping is needed here.
        content = escapeYamlString(content); // Basic escaping for within quotes
        break;
      case "none":
      default:
        // No escaping
        break;
    }

    output += messageTemplate.prefix + content + messageTemplate.suffix;

    // Add separator if not the last message
    if (index < numMessages - 1) {
      output += template.separator;
    }
  });

  output += template.wrapper.end;
  return output;
}
