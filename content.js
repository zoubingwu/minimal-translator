(() => {
  if (globalThis.__minimalTranslatorLoaded) {
    return;
  }
  globalThis.__minimalTranslatorLoaded = true;

  const FALLBACK_BLOCK_SELECTOR = [
    "address",
    "article",
    "aside",
    "blockquote",
    "dd",
    "details",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "section",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "ul",
  ].join(",");
  const INLINE_DISPLAYS = new Set([
    "inline",
    "inline-block",
    "inline-flex",
    "inline-grid",
    "inline-table",
    "ruby",
    "ruby-base",
    "ruby-base-container",
    "ruby-text",
    "ruby-text-container",
    "math",
    "inline-math",
  ]);
  const TRANSLATION_CLASS = "mt-translation";
  const LOADING_CLASS = "mt-loading";
  const ERROR_CLASS = "mt-error";
  const VIEWPORT_BOTTOM_SCREENS = 2;
  const TRANSLATION_BATCH_DELAY = 300;
  const MAX_BATCH_ITEMS = 50;
  const MAX_BATCH_CHARACTERS = 1800;
  const ATOMIC_BLOCK_SELECTOR = [
    "relin-hc",
    "x-p",
    "app-keyword-content",
    ...(location.hostname === "github.com"
      ? ["[itemprop='description']"]
      : []),
  ].join(",");
  const COMMON_EXCLUDE_SELECTORS = [
    "header",
    "nav",
    "footer",
    "aside",
    "form",
    "button",
    "input",
    "textarea",
    "select",
    "option",
    "title",
    "link",
    "script",
    "style",
    "noscript",
    "svg",
    "canvas",
    "pre",
    "kbd",
    "math",
    "[hidden]",
    "[aria-hidden='true']",
    "[contenteditable='true']",
    "[default-translate]",
    ".imt-notranslate",
    ".notranslate",
    "[translate='no']",
    "[role='navigation']",
    "[role='banner']",
    "[role='contentinfo']",
    "[role='menu']",
    "[role='menubar']",
    "[role='complementary']",
    "[role='alert']",
    "[role='alertdialog']",
    "[role='dialog']",
    ".social-share",
    ".post__footer",
    ".share-nav",
    ".o-share",
    "[data-toolbar='share']",
    ".prism-code",
    ".enlighter-code",
    ".rc-CodeBlock",
    "[role='code']",
    "table.highlight",
    "div[class^='codeBlockContent']",
    "div[class^='codeBlockLines']",
    "div[class^='token-line']",
    ".material-icons",
    "material-icon",
    "i.fa",
    "i[class^='fa-']",
    "time",
    ".countdown",
    ".visuallyhidden",
    ".ad",
    ".ads",
    ".advertisement",
    "[class*='advert']",
    "[id*='advert']",
    ".sponsor",
    "[class*='sponsor']",
    "[id*='sponsor']",
  ];
  const GITHUB_EXCLUDE_SELECTORS = [
    "a[data-hovercard-type]",
    "[data-test-selector='commit-tease-commit-message']",
    "[data-test-selector='create-branch.developmentForm']",
    "div.Box-header.position-relative",
    "div.blob-wrapper-embedded",
    "div.Box.Box--condensed.my-2",
    "div.jp-CodeCell",
    "[aria-label='Account'] .markdown-title",
    ".js-repos-container .markdown-title",
    "div.file-navigation + div.Box",
    "[data-testid^='breadcrumbs']",
    "[data-ga-click*='Star']",
    ".blob-code",
    ".timeline-comment-header",
    ".review-thread-reply",
    ".js-suggested-changes-blob.diff-view",
    "a.anchor",
    ".markdown-body h3",
    "div.vcard-names-container",
    "div.js-disable-context-menu",
    ".BorderGrid-cell a[role='link']",
    ".BorderGrid-cell .topic-tag-link",
    "table[class*='Table-module__Box']",
    ".author",
    ".assignee",
    ".codeRepository",
    "[title='Label: Private']",
    "[aria-label*='language']",
    "h1[data-component='PH_Title'] span[class*='issueNumberText']",
    "[data-testid='list-row-repo-name-and-number']",
  ];
  const STAY_ORIGINAL_SELECTOR = [
    "code",
    "tt",
    "g-emoji",
    "img",
    "sup",
    "sub",
    "samp",
    ".issue-link",
  ].join(",");
  const EXCLUDE_SELECTOR = [
    ...COMMON_EXCLUDE_SELECTORS,
    ...(location.hostname === "github.com" ? GITHUB_EXCLUDE_SELECTORS : []),
  ].join(",");
  let translationRun = 0;
  let activeTranslationSession = null;

  addStyles();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== "MT_TRANSLATE_PAGE") {
      return undefined;
    }

    translatePage(message.sourceLanguage, message.targetLanguage)
      .then((count) => sendResponse({ ok: true, count }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  });

  async function translatePage(sourceLanguage, targetLanguage) {
    const run = ++translationRun;
    stopTranslationSession();
    document
      .querySelectorAll(
        `.${TRANSLATION_CLASS}, .${LOADING_CLASS}, .${ERROR_CLASS}`,
      )
      .forEach((element) => element.remove());

    const paragraphs = findParagraphs();
    if (paragraphs.length === 0) {
      throw new Error("No translatable main content was found");
    }

    const session = {
      run,
      sourceLanguage,
      targetLanguage,
      paragraphs: [],
      groups: new Map(),
      queued: new Set(),
      flushTimer: null,
      observer: null,
    };
    activeTranslationSession = session;

    for (const paragraph of paragraphs) {
      const target =
        paragraph.container instanceof Element
          ? paragraph.container
          : paragraph.anchor.parentElement;
      if (!target?.isConnected) {
        continue;
      }
      paragraph.status = "observed";
      session.paragraphs.push(paragraph);
      const group = session.groups.get(target) || [];
      group.push(paragraph);
      session.groups.set(target, group);
    }
    if (session.paragraphs.length === 0) {
      activeTranslationSession = null;
      throw new Error("No translatable main content was found");
    }

    const initialParagraphs = new Set([session.paragraphs[0]]);
    if ("IntersectionObserver" in globalThis) {
      const bottomMargin = globalThis.innerHeight * VIEWPORT_BOTTOM_SCREENS;
      session.observer = new IntersectionObserver(
        (entries, observer) => {
          if (activeTranslationSession !== session) {
            return;
          }
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            observer.unobserve(entry.target);
            queueParagraphs(session, session.groups.get(entry.target) || []);
          }
        },
        { rootMargin: `0px 0px ${bottomMargin}px 0px` },
      );

      for (const target of session.groups.keys()) {
        session.observer.observe(target);
      }
    } else {
      session.paragraphs.forEach((paragraph) => initialParagraphs.add(paragraph));
    }

    queueParagraphs(session, initialParagraphs);
    return session.paragraphs.length;
  }

  function stopTranslationSession() {
    const session = activeTranslationSession;
    if (!session) {
      return;
    }
    session.observer?.disconnect();
    if (session.flushTimer) {
      clearTimeout(session.flushTimer);
    }
    session.paragraphs.forEach(removeLoading);
    session.queued.clear();
    activeTranslationSession = null;
  }

  function queueParagraphs(session, paragraphs) {
    if (activeTranslationSession !== session) {
      return;
    }
    for (const paragraph of paragraphs) {
      if (paragraph.status !== "observed") {
        continue;
      }
      paragraph.status = "queued";
      session.queued.add(paragraph);
    }
    scheduleTranslationFlush(session);
  }

  function scheduleTranslationFlush(session) {
    if (
      activeTranslationSession !== session ||
      session.flushTimer ||
      session.queued.size === 0
    ) {
      return;
    }
    session.flushTimer = setTimeout(() => {
      session.flushTimer = null;
      void flushTranslationQueue(session);
    }, TRANSLATION_BATCH_DELAY);
  }

  function flushTranslationQueue(session) {
    if (activeTranslationSession !== session) {
      return;
    }
    const batch = [...session.queued].filter(
      (paragraph) => paragraph.anchor.isConnected,
    );
    session.queued.clear();
    if (batch.length === 0) {
      return;
    }

    for (const paragraphs of createParagraphBatches(batch)) {
      paragraphs.forEach((paragraph) => {
        paragraph.status = "translating";
        showLoading(paragraph, session.targetLanguage);
      });
      void translateParagraphBatch(session, paragraphs).catch((error) => {
        showBatchError(session, paragraphs, error);
      });
    }
  }

  function createParagraphBatches(paragraphs) {
    const batches = [];
    let batch = [];
    let characters = 0;

    for (const paragraph of paragraphs) {
      const length = paragraph.input.text.length;
      if (
        batch.length > 0 &&
        (batch.length >= MAX_BATCH_ITEMS ||
          characters + length > MAX_BATCH_CHARACTERS)
      ) {
        batches.push(batch);
        batch = [];
        characters = 0;
      }
      batch.push(paragraph);
      characters += length;
    }
    if (batch.length > 0) {
      batches.push(batch);
    }
    return batches;
  }

  function showBatchError(session, paragraphs, error) {
    if (
      activeTranslationSession !== session ||
      session.run !== translationRun
    ) {
      return;
    }
    paragraphs.forEach((paragraph) => {
      removeLoading(paragraph);
      paragraph.status = "error";
      showError(session, paragraph, error);
    });
  }

  async function translateParagraphBatch(session, paragraphs) {
    const response = await chrome.runtime.sendMessage({
      type: "MT_TRANSLATE_BATCH",
      texts: paragraphs.map((paragraph) => paragraph.input.text),
      sourceLanguage: session.sourceLanguage,
      targetLanguage: session.targetLanguage,
    });

    if (
      activeTranslationSession !== session ||
      session.run !== translationRun
    ) {
      return 0;
    }
    if (!response?.ok) {
      throw new Error(response?.error || "Translation request failed");
    }
    if (
      !Array.isArray(response.translations) ||
      response.translations.length !== paragraphs.length
    ) {
      throw new Error("The translation service returned an incomplete result");
    }

    let insertedCount = 0;
    paragraphs.forEach((paragraph, index) => {
      removeLoading(paragraph);
      const parent = paragraph.anchor.parentNode;
      if (!parent || !paragraph.anchor.isConnected) {
        paragraph.status = "detached";
        return;
      }

      const translation = document.createElement("span");
      translation.className = TRANSLATION_CLASS;
      translation.lang = session.targetLanguage;
      translation.translate = false;
      translation.dir = "auto";
      translation.textContent = restoreOriginalText(
        response.translations[index],
        paragraph.input.originals,
      );
      parent.insertBefore(translation, paragraph.anchor.nextSibling);
      paragraph.status = "translated";
      insertedCount += 1;
    });

    return insertedCount;
  }

  function showLoading(paragraph, targetLanguage) {
    removeLoading(paragraph);
    removeError(paragraph);
    const parent = paragraph.anchor.parentNode;
    if (!parent || !paragraph.anchor.isConnected) {
      return;
    }

    const loading = document.createElement("span");
    loading.className = LOADING_CLASS;
    loading.lang = targetLanguage;
    loading.translate = false;
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-label", "Translating");
    loading.title = "Translating";
    parent.insertBefore(loading, paragraph.anchor.nextSibling);
    paragraph.loadingElement = loading;
  }

  function removeLoading(paragraph) {
    paragraph.loadingElement?.remove();
    paragraph.loadingElement = null;
  }

  function showError(session, paragraph, error) {
    removeError(paragraph);
    const parent = paragraph.anchor.parentNode;
    if (!parent || !paragraph.anchor.isConnected) {
      return;
    }

    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = ERROR_CLASS;
    retry.translate = false;
    retry.textContent = "Translation failed · Retry";
    retry.title = error instanceof Error ? error.message : String(error);
    retry.addEventListener("click", () => {
      if (activeTranslationSession !== session) {
        return;
      }
      removeError(paragraph);
      paragraph.status = "observed";
      queueParagraphs(session, [paragraph]);
    });
    parent.insertBefore(retry, paragraph.anchor.nextSibling);
    paragraph.errorElement = retry;
  }

  function removeError(paragraph) {
    paragraph.errorElement?.remove();
    paragraph.errorElement = null;
  }

  function findParagraphs() {
    const forcedRoots = findSiteRuleRoots();
    const readabilityRoot = forcedRoots.length ? null : findReadabilityRoot();
    const roots = forcedRoots.length
      ? forcedRoots
      : readabilityRoot
        ? [readabilityRoot]
        : [document.body];
    const paragraphs = [];
    const seen = new Set();

    for (const root of roots) {
      if (root.closest?.(EXCLUDE_SELECTOR)) {
        continue;
      }
      for (const paragraph of walkParagraphs(root)) {
        if (!seen.has(paragraph.anchor)) {
          seen.add(paragraph.anchor);
          paragraphs.push(paragraph);
        }
      }
    }

    return paragraphs;
  }

  function findSiteRuleRoots() {
    if (location.hostname !== "github.com") {
      return [];
    }

    return [...document.querySelectorAll(".markdown-body")].filter(
      (element) =>
        element.getClientRects().length > 0 &&
        !isHidden(element) &&
        !element.closest(EXCLUDE_SELECTOR),
    );
  }

  function findReadabilityRoot() {
    if (typeof globalThis.Readability !== "function") {
      throw new Error("The main-content extractor failed to load");
    }

    try {
      const clone = document.cloneNode(true);
      const article = new globalThis.Readability(clone, {
        keepClasses: true,
      }).parse();
      if (!article?.content) {
        return null;
      }

      const root = mapReadabilityContent(article.content);
      return isQualifiedArticle(root) ? root : null;
    } catch {
      return null;
    }
  }

  function isQualifiedArticle(root) {
    if (!root || (root.innerText || "").length < 800) {
      return false;
    }

    return (
      root.querySelectorAll("pre").length >= 1 ||
      root.querySelectorAll("p").length >= 4 ||
      root.querySelectorAll("article").length >= 1
    );
  }

  function mapReadabilityContent(content) {
    const parsed = new DOMParser().parseFromString(content, "text/html");
    const articleNodes = parsed.querySelectorAll("#readability-page-1 > *");
    const liveNodes = [];

    for (const articleNode of articleNodes) {
      const sample = findTextSample(articleNode);
      for (const selector of createMappingSelectors(articleNode)) {
        let candidates;
        try {
          candidates = document.body.querySelectorAll(selector);
        } catch {
          continue;
        }
        if (candidates.length === 0 || candidates.length > 8) {
          continue;
        }

        let bestMatch = null;
        for (const candidate of candidates) {
          const text = candidate.textContent || "";
          const renderedText = candidate.innerText || "";
          if (
            sample &&
            !text.includes(sample) &&
            !renderedText.includes(sample)
          ) {
            continue;
          }
          if (
            !bestMatch ||
            text.trim().length > (bestMatch.textContent || "").trim().length
          ) {
            bestMatch = candidate;
          }
        }

        if (bestMatch) {
          liveNodes.push(bestMatch);
          break;
        }
      }
    }

    return findCommonAncestor(liveNodes, document.body);
  }

  function findTextSample(element) {
    const walker = element.ownerDocument.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
    );
    let node;
    while ((node = walker.nextNode())) {
      if ((node.textContent || "").trim().length <= 20) {
        continue;
      }
      const lines = (
        node.parentElement?.innerText ||
        node.parentElement?.textContent ||
        ""
      )
        .trim()
        .split("\n");
      return lines.reduce(
        (longest, line) => (line.length > longest.length ? line : longest),
        "",
      );
    }
    return "";
  }

  function createMappingSelectors(element) {
    const classes = [...element.classList]
      .filter((name) => !/[.:/\[]/.test(name))
      .map((name) => `.${CSS.escape(name.trim())}`);
    const selectors = [];

    if (element.id) {
      const idSelector = `#${CSS.escape(element.id)}`;
      selectors.push(`${idSelector}${classes.join("")}`);
      selectors.push(
        `${idSelector}${classes.filter((name) => name !== ".container").join("")}`,
      );
      selectors.push(idSelector);
    } else {
      selectors.push(classes.join(""));
      selectors.push(
        classes.filter((name) => name !== ".container").join(""),
      );
    }

    const uniqueSelectors = [...new Set(selectors)].filter(Boolean);
    return uniqueSelectors.length ? uniqueSelectors : [element.tagName];
  }

  function findCommonAncestor(nodes, boundary) {
    if (nodes.length === 0) {
      return null;
    }

    const ancestorSets = nodes.map((node) => {
      const ancestors = new Set();
      for (let parent = node.parentNode; parent; parent = parent.parentNode) {
        ancestors.add(parent);
        if (parent === boundary) {
          break;
        }
      }
      return ancestors;
    });

    for (const ancestor of ancestorSets[0]) {
      if (
        (ancestor.nodeType === Node.ELEMENT_NODE ||
          ancestor.nodeType === Node.DOCUMENT_FRAGMENT_NODE) &&
        !ancestor.matches?.(ATOMIC_BLOCK_SELECTOR) &&
        ancestorSets.every((set) => set.has(ancestor))
      ) {
        return ancestor;
      }
    }
    return null;
  }

  function walkParagraphs(root) {
    const paragraphs = [];
    let current = null;

    visit(root, root, true);
    flush();
    return paragraphs;

    function visit(node, owner, isRoot = false) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (
          text.trim() &&
          typeof node.parentNode?.getBoundingClientRect === "function" &&
          hasTinyRenderedDimension(node.parentNode)
        ) {
          return;
        }
        if (text) {
          addItem(owner, node, text, false);
        }
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node;
      if (
        element.classList.contains(TRANSLATION_CLASS) ||
        element.classList.contains(LOADING_CLASS) ||
        element.classList.contains(ERROR_CLASS)
      ) {
        return;
      }
      const style = getComputedStyle(element);
      const rawIsBlock = isRawBlockElement(element, style);
      const stayOriginal = element.matches(STAY_ORIGINAL_SELECTOR);
      if (isHidden(element, style)) {
        return;
      }
      if (
        element.matches(EXCLUDE_SELECTOR) ||
        (rawIsBlock && stayOriginal)
      ) {
        if (
          rawIsBlock &&
          element.childNodes.length > 0 &&
          element.firstChild?.hasChildNodes()
        ) {
          flush();
        }
        return;
      }

      const isPreWhitespace =
        style.whiteSpace.startsWith("pre") || style.whiteSpace === "break-spaces";
      if (
        element.childNodes.length > 0 &&
        !isPreWhitespace &&
        hasTinyRenderedDimension(element) &&
        (element.textContent?.trim().length || 0) < 2
      ) {
        return;
      }
      if (stayOriginal) {
        const text =
          element.tagName === "IMG"
            ? element.getAttribute("alt") || ""
            : element.textContent || "";
        if (text) {
          addItem(owner, element, text, true);
        }
        return;
      }

      const isBlock = isBlockElement(element, style, rawIsBlock);
      if (isBlock && !isRoot) {
        flush();
      }
      const nextOwner = isBlock ? element : owner;
      for (const child of element.childNodes) {
        visit(child, nextOwner);
      }
      if (isBlock) {
        flush();
      }
    }

    function addItem(container, node, text, original) {
      if (!current || current.container !== container) {
        flush();
        current = { container, items: [] };
      }
      current.items.push({ node, text, original });
    }

    function flush() {
      if (!current?.items.length) {
        current = null;
        return;
      }

      const anchor = findAnchor(current.items.at(-1).node, current.container);
      const input = createTranslationInput(current.items);
      let translatableText = input.text;
      for (const original of input.originals) {
        translatableText = translatableText.replaceAll(original.token, "");
      }
      if (anchor && shouldTranslate(translatableText)) {
        paragraphs.push({ anchor, input, container: current.container });
      }
      current = null;
    }
  }

  function isRawBlockElement(element, style = getComputedStyle(element)) {
    if (element.matches(ATOMIC_BLOCK_SELECTOR)) {
      return false;
    }

    if (
      (location.hostname === "github.com" && element.tagName === "BDI") ||
      ["BR", "INPUT"].includes(element.tagName)
    ) {
      return true;
    }
    if (
      getComputedStyle(element.parentElement || element).display === "inline-flex"
    ) {
      return false;
    }
    return style.display
      ? !INLINE_DISPLAYS.has(style.display)
      : element.matches(FALLBACK_BLOCK_SELECTOR);
  }

  function isBlockElement(
    element,
    style = getComputedStyle(element),
    isBlock = isRawBlockElement(element, style),
  ) {
    if (
      isBlock &&
      element.childNodes.length === 1 &&
      element.firstChild?.nodeType === Node.TEXT_NODE &&
      (element.innerText || "").length === 1 &&
      Number.parseFloat(style.fontSize) >= 35
    ) {
      return false;
    }
    return isBlock;
  }

  function findAnchor(node, container) {
    let anchor = node;
    while (anchor.parentNode && anchor.parentNode !== container) {
      anchor = anchor.parentNode;
    }
    if (anchor.parentNode !== container) {
      return null;
    }

    while (anchor.nextSibling) {
      const next = anchor.nextSibling;
      if (
        next.nodeType === Node.ELEMENT_NODE &&
        isBlockElement(next)
      ) {
        break;
      }
      anchor = next;
    }
    return anchor;
  }

  function createTranslationInput(items) {
    const originals = [];
    let text = "";
    for (const item of items) {
      if (item.original) {
        const token = `[[MT_${originals.length}]]`;
        originals.push({ token, text: item.text });
        text += token;
      } else {
        text += item.text;
      }
    }
    return {
      text: text.replace(/\s+/g, " ").trim(),
      originals,
    };
  }

  function shouldTranslate(value) {
    const text = value.trim();
    if (
      !text ||
      /^[\u200B\u200C\u200D\u2060\uFEFF]+$/.test(text) ||
      /^[0-9.,/#!$%^&*;:{}=\-_`~()\s]+$/.test(text) ||
      /^https?:\/\/\S+$/i.test(text) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ||
      /^@\S+$/.test(text) ||
      /^#[^\s#]+$/.test(text) ||
      !/\p{L}/u.test(text)
    ) {
      return false;
    }
    return /[^\x00-\x7F]/.test(text) || text.length >= 2;
  }

  function restoreOriginalText(translation, originals) {
    let restored = translation;
    for (const original of originals) {
      if (restored.includes(original.token)) {
        restored = restored.replaceAll(original.token, original.text);
      } else if (original.text) {
        restored += `${restored ? " " : ""}${original.text}`;
      }
    }
    return restored;
  }

  function hasTinyRenderedDimension(element) {
    const { width, height } = element.getBoundingClientRect();
    return (width > 0 && width < 4) || (height > 0 && height < 4);
  }

  function isHidden(element, style = getComputedStyle(element)) {
    return (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    );
  }

  function addStyles() {
    if (document.querySelector("style[data-mt-styles]")) {
      return;
    }
    const style = document.createElement("style");
    style.dataset.mtStyles = "";
    style.textContent = `
      .${TRANSLATION_CLASS} {
        display: block !important;
        margin-top: 0.45em !important;
        color: inherit !important;
        font: inherit !important;
        font-weight: 400 !important;
        line-height: inherit !important;
        opacity: 0.78 !important;
        text-align: start !important;
      }
      .${LOADING_CLASS} {
        display: inline-block !important;
        width: 10px !important;
        height: 10px !important;
        box-sizing: border-box !important;
        margin: 0 4px !important;
        border: 2px solid rgba(127, 127, 127, 0.35) !important;
        border-top-color: currentColor !important;
        border-left-color: currentColor !important;
        border-radius: 50% !important;
        color: inherit !important;
        vertical-align: middle !important;
        animation: mt-loading-animation 0.6s linear infinite !important;
      }
      @keyframes mt-loading-animation {
        to { transform: rotate(360deg); }
      }
      .${ERROR_CLASS} {
        display: inline !important;
        margin: 0 4px !important;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
        color: #0969da !important;
        font: inherit !important;
        line-height: inherit !important;
        cursor: pointer !important;
      }
    `;
    document.documentElement.append(style);
  }
})();
