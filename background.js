const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/t";
const MAX_BATCH_ITEMS = 50;
const MAX_BATCH_CHARACTERS = 1800;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "MT_TRANSLATE_BATCH") {
    return undefined;
  }

  translateAll(message.texts, message.sourceLanguage, message.targetLanguage)
    .then((translations) => sendResponse({ ok: true, translations }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function translateAll(texts, sourceLanguage, targetLanguage) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const parts = texts.flatMap((text, index) =>
    splitLongText(text).map((part) => ({ index, text: part })),
  );
  const translatedParts = [];

  for (const batch of createBatches(parts.map((part) => part.text))) {
    translatedParts.push(
      ...(await translateBatch(batch, sourceLanguage, targetLanguage)),
    );
  }

  const translations = texts.map(() => []);
  parts.forEach((part, index) => {
    translations[part.index].push(translatedParts[index]);
  });
  const separator = /^(zh|ja|ko)(-|$)/.test(targetLanguage) ? "" : " ";
  return translations.map((translation) => translation.join(separator));
}

function splitLongText(text) {
  const parts = [];
  let remaining = text.trim();

  while (remaining.length > MAX_BATCH_CHARACTERS) {
    const window = remaining.slice(0, MAX_BATCH_CHARACTERS);
    const preferredSplit = Math.max(
      ...[". ", "! ", "? ", "。", "！", "？", "\n"].map(
        (separator) => window.lastIndexOf(separator) + separator.length,
      ),
    );
    const wordSplit = window.lastIndexOf(" ") + 1;
    const splitAt =
      preferredSplit >= MAX_BATCH_CHARACTERS / 2
        ? preferredSplit
        : wordSplit >= MAX_BATCH_CHARACTERS / 2
          ? wordSplit
          : MAX_BATCH_CHARACTERS;

    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining) {
    parts.push(remaining);
  }
  return parts;
}

function createBatches(texts) {
  const batches = [];
  let batch = [];
  let characters = 0;

  for (const text of texts) {
    if (
      batch.length > 0 &&
      (batch.length >= MAX_BATCH_ITEMS ||
        characters + text.length > MAX_BATCH_CHARACTERS)
    ) {
      batches.push(batch);
      batch = [];
      characters = 0;
    }

    batch.push(text);
    characters += text.length;
  }

  if (batch.length > 0) {
    batches.push(batch);
  }

  return batches;
}

async function translateBatch(texts, sourceLanguage, targetLanguage) {
  const query = new URLSearchParams({
    client: "gtx",
    dt: "t",
    sl: sourceLanguage,
    tl: targetLanguage,
  });
  const body = new URLSearchParams();

  for (const text of texts) {
    body.append("q", text);
  }

  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch(`${TRANSLATE_URL}?${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        credentials: "omit",
        signal: AbortSignal.timeout(15000),
      });

      if (
        response.ok ||
        (response.status !== 429 && response.status < 500) ||
        attempt === 1
      ) {
        break;
      }
    } catch {
      if (attempt === 1) {
        throw new Error("Google Translate network request failed");
      }
    }
  }

  if (!response.ok) {
    throw new Error(`Google Translate request failed (${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Google Translate returned unrecognized data");
  }

  if (!Array.isArray(data) || data.length !== texts.length) {
    throw new Error("Google Translate returned unrecognized data");
  }

  return data.map((item) => {
    const translation = Array.isArray(item) ? item[0] : item;
    if (typeof translation !== "string") {
      throw new Error("Google Translate returned an invalid translation");
    }

    return decodeHtmlEntities(translation);
  });
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&#38;/gi, "&")
    .replace(/&#60;/gi, "<")
    .replace(/&#62;/gi, ">")
    .replace(/&#160;/gi, " ");
}
