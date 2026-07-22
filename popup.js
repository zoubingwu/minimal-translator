const DEFAULT_SETTINGS = {
  sourceLanguage: "auto",
  targetLanguage: "zh-CN",
};

const sourceLanguage = document.querySelector("#sourceLanguage");
const targetLanguage = document.querySelector("#targetLanguage");
const translateButton = document.querySelector("#translateButton");
const status = document.querySelector("#status");

loadSettings();

sourceLanguage.addEventListener("change", saveSettings);
targetLanguage.addEventListener("change", saveSettings);
translateButton.addEventListener("click", translateCurrentPage);

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  sourceLanguage.value = settings.sourceLanguage;
  targetLanguage.value = settings.targetLanguage;
}

function saveSettings() {
  return chrome.storage.sync.set({
    sourceLanguage: sourceLanguage.value,
    targetLanguage: targetLanguage.value,
  });
}

async function translateCurrentPage() {
  translateButton.disabled = true;
  status.textContent = "Starting…";

  try {
    await saveSettings();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      throw new Error("Unable to access the current tab");
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["vendor/Readability.js", "content.js"],
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "MT_TRANSLATE_PAGE",
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Page translation failed");
    }

    status.textContent = `Started. Found ${response.count} main-content paragraphs; scroll to continue translating.`;
  } catch (error) {
    status.textContent = error.message || "This page could not be translated";
  } finally {
    translateButton.disabled = false;
  }
}
