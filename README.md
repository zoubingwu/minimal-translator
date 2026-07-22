# Minimal Translator

Minimal Translator is a build-free Chrome Manifest V3 extension that translates the main content of a webpage with Google Translate and places each translation directly below its original paragraph.

## Features

- Main-content extraction with Mozilla Readability 0.6.0 and a DOM-walker fallback.
- A GitHub-specific `.markdown-body` rule that covers pull request descriptions and discussion bodies.
- Filtering for headers, navigation, footers, sharing controls, code blocks, forms, advertisements, and other unrelated page elements.
- Dynamic viewport scheduling for the first paragraph, the current viewport, and two screens below it.
- Progressive batches of up to 50 paragraphs or 1,800 characters. Each completed batch renders immediately while other paragraphs keep their loading indicators.
- Per-paragraph loading indicators and an inline retry action after a failed request.
- Preserved inline code, image alternative text, superscripts, and subscripts through translation placeholders.
- Source-language auto-detection and Simplified Chinese as the default target language.
- Minimal permissions: page access begins with a user action, and network access is limited to the Google Translate endpoint.

## Install

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this repository directory.

## Use

1. Open an article or another content-heavy webpage.
2. Select **Minimal Translator** from the Chrome toolbar.
3. Choose the source and target languages.
4. Select **Translate this page**.

The extension translates paragraphs in and near the viewport first. More paragraphs enter the translation queue as you scroll. Running the action again rescans the page with the current language settings and replaces existing translations.

## How it works

1. A site rule or Readability identifies the main-content root.
2. A DOM walker creates paragraph-level translation inputs while preserving protected inline content.
3. `IntersectionObserver` schedules the first paragraph, the current viewport, and two screens below it.
4. A 300 ms queue groups newly visible paragraphs into requests of at most 50 paragraphs or 1,800 characters.
5. Each request completes independently. Its loading indicators are removed and its translations are inserted immediately below the corresponding source paragraphs.
6. Requests created by later scrolling can run while earlier requests are still pending.

## Behavior derived from Immersive Translate

The implementation was informed by the locally installed Chrome extension `bpoadfkcbjbfhfodiogcnhhhpibjhbnh`, version `1.31.2`:

- Its Google service supports the keyless `https://translate.googleapis.com/translate_a/t` batch endpoint.
- It runs Mozilla Readability on a cloned document and maps the result back to live DOM nodes with selectors, text anchors, and common ancestors.
- Its GitHub rule treats `.markdown-body` as forced translatable content.
- Its default dynamic mode uses `visibleObserverScreens: [0, 0, 2, 0]` and a roughly 300 ms paragraph queue.
- It forms rate-limited concurrent groups of up to 50 paragraphs or 1,800 characters and renders each paragraph as soon as its network group completes.
- Its default loading theme inserts a spinner after the source paragraph, removes it when the request settles, and exposes a retry action after an error.
- Its default translation position is `after`, which produces the source-above, translation-below layout.

Minimal Translator independently implements this focused behavior set: main-content extraction, the GitHub content rule, viewport scheduling, progressive rendering, loading and retry states, language settings, and translations below their source paragraphs.

Mozilla Readability is included unchanged under the Apache License 2.0. See `vendor/Readability.LICENSE.md` and `vendor/Apache-2.0.txt`.

## Limitations and privacy

The `translate_a/t` endpoint is a webpage translation endpoint. Google controls its availability and rate limits. Startup errors appear in the extension popup, and failed paragraph requests expose an inline retry action.

Chrome internal pages and the Chrome Web Store restrict script injection. GitHub has a dedicated content rule; other sites use Readability and the generic DOM walker. Results on Shadow DOM pages and highly non-semantic layouts depend on the HTML exposed by the page.

Text selected for translation is sent to Google Translate.
