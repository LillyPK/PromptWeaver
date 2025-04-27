document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const jsonOutputContainer = document.getElementById("json-output-container");
  const jsonContentWrapper = document.getElementById("json-content-wrapper");
  const lineNumbersDiv = document.getElementById("line-numbers");
  const jsonlOutputPre = document.getElementById("json-pre");
  const jsonlOutputCode = document.getElementById("jsonl-output");
  const jsonContextMenu = document.getElementById("json-context-menu");
  const copyJsonButton = document.getElementById("copy-json-button");
  const editJsonButton = document.getElementById("edit-json-button");
  const saveJsonButton = document.getElementById("save-json-button");
  const cancelJsonButton = document.getElementById("cancel-json-button");

  let messages = [];
  let isEditingJson = false;
  const indentSpaces = "  "; // For Tab key handling

  // --- Helper Functions ---

  // Extracts the filtering logic
  function getFilteredMessages() {
    return messages.filter((msg, index) => {
      // Keep if content is not empty
      if (msg.content.trim() !== "") return true;
      // Filter out all empty messages for JSON output
      return false;
    });
  }

  // --- Core Functions ---

  function createMessageElements(index, userData = "", assistantData = "") {
    const pairDiv = document.createElement("div");
    pairDiv.className =
      "message-pair p-4 border border-border rounded-md bg-card shadow-sm";
    pairDiv.dataset.index = index;

    // User Input
    const userDiv = document.createElement("div");
    const userLabel = document.createElement("label");
    userLabel.htmlFor = `user-${index}`;
    userLabel.className = "block text-sm font-medium mb-1 text-foreground";
    userLabel.textContent = `User ${index + 1}`;
    const userInput = document.createElement("textarea");
    userInput.id = `user-${index}`;
    userInput.dataset.role = "user";
    userInput.dataset.index = index;
    userInput.placeholder = "Enter user message...";
    userInput.rows = 3;
    userInput.value = userData;
    userInput.className =
      "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    userDiv.appendChild(userLabel);
    userDiv.appendChild(userInput);

    // Assistant Input
    const assistantDiv = document.createElement("div");
    const assistantLabel = document.createElement("label");
    assistantLabel.htmlFor = `assistant-${index}`;
    assistantLabel.className = "block text-sm font-medium mb-1 text-foreground";
    assistantLabel.textContent = `Assistant ${index + 1}`;
    const assistantInput = document.createElement("textarea");
    assistantInput.id = `assistant-${index}`;
    assistantInput.dataset.role = "assistant";
    assistantInput.dataset.index = index;
    assistantInput.placeholder = "Enter assistant response...";
    assistantInput.rows = 3;
    assistantInput.value = assistantData;
    assistantInput.className =
      "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    assistantDiv.appendChild(assistantLabel);
    assistantDiv.appendChild(assistantInput);

    pairDiv.appendChild(userDiv);
    pairDiv.appendChild(assistantDiv);

    return pairDiv;
  }

  function rebuildChatUI() {
    chatContainer.innerHTML = "";
    const numPairs = Math.ceil(messages.length / 2);

    for (let i = 0; i < numPairs; i++) {
      const userMsg = messages[i * 2]?.content || "";
      const assistantMsg = messages[i * 2 + 1]?.content || "";
      const messageElements = createMessageElements(i, userMsg, assistantMsg);
      chatContainer.appendChild(messageElements);
    }

    if (messages.length === 0 || messages[messages.length - 1]?.content) {
      addMessagePair();
    }
  }

  function addMessagePair() {
    const newIndex = Math.floor(messages.length / 2);

    if (messages.length % 2 !== 0) {
      messages.push({ role: "assistant", content: "" });
      const correctedIndex = Math.floor(messages.length / 2);
      if (correctedIndex === newIndex) {
        messages.push({ role: "user", content: "" });
        messages.push({ role: "assistant", content: "" });
      }
    } else {
      messages.push({ role: "user", content: "" });
      messages.push({ role: "assistant", content: "" });
    }

    const messageElements = createMessageElements(newIndex);
    chatContainer.appendChild(messageElements);
  }

  function updateJsonlOutput() {
    if (isEditingJson) return;

    const filteredMessages = getFilteredMessages(); // Use helper

    const jsonlData = {
      messages: filteredMessages,
    };

    // Use 2 spaces for display
    const jsonString = JSON.stringify(jsonlData, null, 2);
    jsonlOutputCode.textContent = jsonString;

    // Generate Line Numbers
    const lines = jsonString.split("\n");
    const lineCount = jsonString === "" ? 0 : lines.length;
    lineNumbersDiv.innerHTML = "";

    for (let i = 1; i <= lineCount; i++) {
      const numberDiv = document.createElement("div");
      numberDiv.textContent = i;
      lineNumbersDiv.appendChild(numberDiv);
    }
    if (jsonString.endsWith("\n") && lineCount > 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.innerHTML = "&nbsp;";
      lineNumbersDiv.appendChild(emptyDiv);
    }
  }

  function setChatInputEnabled(enabled) {
    const textareas = chatContainer.querySelectorAll("textarea");
    if (enabled) {
      chatContainer.classList.remove("disabled");
      textareas.forEach((ta) => (ta.disabled = false));
    } else {
      chatContainer.classList.add("disabled");
      textareas.forEach((ta) => (ta.disabled = true));
    }
  }

  function setJsonEditable(editable) {
    isEditingJson = editable;
    if (editable) {
      jsonlOutputPre.contentEditable = "true";
      jsonlOutputPre.focus();
      saveJsonButton.classList.remove("hidden");
      cancelJsonButton.classList.remove("hidden");
      jsonlOutputPre.classList.add("ring-2", "ring-ring", "bg-background");
      lineNumbersDiv.classList.add("opacity-70");
      setChatInputEnabled(false);
    } else {
      jsonlOutputPre.contentEditable = "false";
      saveJsonButton.classList.add("hidden");
      cancelJsonButton.classList.add("hidden");
      jsonlOutputPre.classList.remove("ring-2", "ring-ring", "bg-background");
      lineNumbersDiv.classList.remove("opacity-70");
      setChatInputEnabled(true);
      updateJsonlOutput();
    }
  }

  // --- Event Handling ---

  jsonOutputContainer.addEventListener("click", (event) => {
    const isClickOnMenu = jsonContextMenu.contains(event.target);
    if (!isEditingJson && !isClickOnMenu) {
      jsonContextMenu.classList.add("hidden");
      const rect = jsonOutputContainer.getBoundingClientRect();
      const x =
        event.pageX -
        rect.left -
        window.scrollX +
        jsonOutputContainer.scrollLeft;
      const y =
        event.pageY - rect.top - window.scrollY + jsonOutputContainer.scrollTop;
      jsonContextMenu.style.left = `${x}px`;
      jsonContextMenu.style.top = `${y}px`;
      jsonContextMenu.classList.remove("hidden");
    }
  });

  document.addEventListener("click", (event) => {
    const isClickOutsideContainer = !jsonOutputContainer.contains(event.target);
    const isClickOutsideMenu = !jsonContextMenu.contains(event.target);
    if (isClickOutsideContainer && isClickOutsideMenu) {
      jsonContextMenu.classList.add("hidden");
    }
  });

  // Modified: Copy Button uses 4-space indent
  copyJsonButton.addEventListener("click", () => {
    // Get the current filtered data
    const filteredMessages = getFilteredMessages(); // Use helper
    const jsonlDataToCopy = {
      messages: filteredMessages,
    };

    // Stringify with 4 spaces specifically for copying
    const stringToCopy = JSON.stringify(jsonlDataToCopy, null, 4);

    navigator.clipboard
      .writeText(stringToCopy) // Copy the 4-space version
      .then(() => {
        copyJsonButton.textContent = "Copied!";
        setTimeout(() => {
          copyJsonButton.textContent = "Copy";
          jsonContextMenu.classList.add("hidden");
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text.");
        jsonContextMenu.classList.add("hidden");
      });
  });

  editJsonButton.addEventListener("click", () => {
    setJsonEditable(true);
    jsonContextMenu.classList.add("hidden");
  });

  saveJsonButton.addEventListener("click", () => {
    const editedText = jsonlOutputPre.textContent;
    try {
      const parsedData = JSON.parse(editedText);
      if (!parsedData || !Array.isArray(parsedData.messages)) {
        throw new Error("Invalid JSON structure: Missing 'messages' array.");
      }
      messages = parsedData.messages;
      rebuildChatUI();
      setJsonEditable(false);
    } catch (error) {
      console.error("Invalid JSON:", error);
      alert(
        `Invalid JSON format: ${error.message}\nPlease correct it and try saving again.`
      );
      jsonlOutputPre.focus();
    }
  });

  cancelJsonButton.addEventListener("click", () => {
    setJsonEditable(false);
  });

  chatContainer.addEventListener("input", (event) => {
    if (event.target.tagName === "TEXTAREA") {
      const textarea = event.target;
      const index = parseInt(textarea.dataset.index, 10);
      const role = textarea.dataset.role;
      const content = textarea.value;
      const messageArrayIndex = role === "user" ? index * 2 : index * 2 + 1;

      if (messageArrayIndex < messages.length && messages[messageArrayIndex]) {
        const wasEmpty = messages[messageArrayIndex].content === "";
        messages[messageArrayIndex].content = content;
        updateJsonlOutput();
        const isNowNotEmpty = content.trim() !== "";
        const currentLastPairIndex = Math.floor((messages.length - 1) / 2);
        if (index === currentLastPairIndex && wasEmpty && isNowNotEmpty) {
          addMessagePair();
        }
      } else {
        console.error("State mismatch: Message not found at expected index.", {
          index,
          role,
          messageArrayIndex,
          messagesLength: messages.length,
        });
      }
    }
  });

  jsonlOutputPre.addEventListener("keydown", (event) => {
    if (!isEditingJson) {
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        if (event.shiftKey) {
          const { startContainer, startOffset } = range;
          if (startContainer.nodeType === Node.TEXT_NODE) {
            const textContent = startContainer.textContent;
            let lineStartOffset =
              textContent.lastIndexOf("\n", startOffset - 1) + 1;
            if (
              textContent.substring(
                lineStartOffset,
                lineStartOffset + indentSpaces.length
              ) === indentSpaces &&
              startOffset >= lineStartOffset + indentSpaces.length
            ) {
              const outdentRange = document.createRange();
              outdentRange.setStart(startContainer, lineStartOffset);
              outdentRange.setEnd(
                startContainer,
                lineStartOffset + indentSpaces.length
              );
              outdentRange.deleteContents();
            }
          }
        } else {
          document.execCommand("insertText", false, indentSpaces);
        }
      } else {
        console.log("Tab/Shift+Tab on selection not implemented.");
      }
    }
  });

  // --- Initialization ---
  rebuildChatUI();
  updateJsonlOutput();
});
