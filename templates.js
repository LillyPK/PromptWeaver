// templates.js - Defines output format templates

export const formatTemplates = {
  JSON: {
    formatName: "JSON",
    wrapper: { start: '{\n  "messages": [\n', end: "\n  ]\n}\n" },
    messageTemplates: {
      user: { prefix: '    { "role": "user", "content": "', suffix: '" }' },
      assistant: {
        prefix: '    { "role": "assistant", "content": "',
        suffix: '" }',
      },
      system: { prefix: '    { "role": "system", "content": "', suffix: '" }' },
    },
    separator: ",\n",
    escapeType: "json",
    // isEditable: true, // No longer strictly needed for button enabling
    copyIndent: 4,
  },
  JSONL: {
    formatName: "JSONL",
    wrapper: { start: '{\n  "messages": [\n', end: "\n  ]\n}\n" },
    messageTemplates: {
      user: {
        prefix: '    {\n      "role": "user",\n      "content": "',
        suffix: '"\n    }',
      },
      assistant: {
        prefix: '    {\n      "role": "assistant",\n      "content": "',
        suffix: '"\n    }',
      },
      system: {
        prefix: '    {\n      "role": "system",\n      "content": "',
        suffix: '"\n    }',
      },
    },
    separator: ",\n",
    escapeType: "json",
    // isEditable: false, // No longer strictly needed for button enabling
    copyIndent: null,
  },
  ChatML: {
    formatName: "ChatML",
    wrapper: { start: "", end: "" },
    messageTemplates: {
      system: { prefix: "<|im_start|>system\n", suffix: "\n<|im_end|>" },
      user: { prefix: "<|im_start|>user\n", suffix: "\n<|im_end|>" },
      assistant: { prefix: "<|im_start|>assistant\n", suffix: "\n<|im_end|>" },
    },
    separator: "\n",
    escapeType: "none",
    // isEditable: false,
    copyIndent: null,
  },
  YAML: {
    formatName: "YAML",
    wrapper: { start: "messages:\n", end: "" },
    messageTemplates: {
      user: { prefix: '- role: user\n  content: "', suffix: '"' },
      assistant: { prefix: '- role: assistant\n  content: "', suffix: '"' },
      system: { prefix: '- role: system\n  content: "', suffix: '"' },
    },
    separator: "\n",
    escapeType: "yaml",
    // isEditable: false,
    copyIndent: null,
  },
  Markdown: {
    formatName: "Markdown",
    wrapper: { start: "", end: "" },
    messageTemplates: {
      user: { prefix: "**User:**\n", suffix: "" },
      assistant: { prefix: "**Assistant:**\n", suffix: "" },
      system: { prefix: "**System:**\n", suffix: "" },
    },
    separator: "\n\n",
    escapeType: "none",
    // isEditable: false,
    copyIndent: null,
  },
};

export const defaultFormatName = "JSON";
