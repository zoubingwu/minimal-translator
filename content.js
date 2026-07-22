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
  const EXTRA_INLINE_SELECTOR = [
    "p a span",
    "article a span",
    "p > span a span",
    "a[data-testid='Link'] span",
    ".MathJax_Preview",
    ".MathJax",
    "math",
    ".highlighter--highlighted",
    ".rw-highlight",
    "ruby *",
    ...(location.hostname === "github.com" ? ["g-emoji"] : []),
  ].join(",");
  const EXTRA_BLOCK_SELECTOR = [
    "turbo-frame",
    "readme-toc",
    "#hs_cos_wrapper_post_body",
    "ul > li",
    "label",
    "[class*='menu-button']",
    "br",
    ".xt-google-domain-link-metrics",
    ...(location.hostname === "github.com" ? ["bdi"] : []),
  ].join(",");
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
    "aside:not(.note):not(.article-comments):not(.onebox)",
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
    "base",
    "wbr",
    "rt",
    "rp",
    "meta",
    "tts-sentence",
    "aio-code",
    "relin-target",
    "datetime",
    "[hidden]",
    "[aria-hidden='true']",
    "[contenteditable='true']",
    "[default-translate]",
    ".uacc-clickable",
    "#monica-content-root",
    "#immersive-translate-popup",
    "#immersive-translate-float-ball",
    ".imt-notranslate",
    ".notranslate",
    "[translate='no']",
    "[role='navigation']",
    "[role='banner']",
    "[role='contentinfo']",
    "[role='menu']",
    "[role='menubar']",
    "[role='complementary']:not(aside.note):not(aside.article-comments):not(aside.onebox)",
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
    "#omni-extension",
    ".omni-item",
    "div[data-paste-markdown-skip]",
    "table.highlight",
    "div[class^='codeBlockContent']",
    "div[class^='codeBlockLines']",
    "div[class^='token-line']",
    "#liuchan-window > .liuchan-container > *",
    ".material-icons",
    "material-icon",
    "i.fa",
    "i[class^='fa-']",
    ".google-symbols",
    "span[class^='material-symbols-']",
    "h1 br",
    "h2 br",
    "h3 br",
    "h4 br",
    "time",
    ".countdown",
    ".visuallyhidden",
    ".pdfViewer .textLayer span[role='presentation']",
    ".rpv-core__text-layer > span[role='presentation']",
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
  const GITHUB_CONTENT_SELECTORS = [
    "h1",
    "[aria-label='Issues'] .markdown-title",
    "[aria-labelledby='discussions-list'] .markdown-title",
    "h3 .markdown-title",
    ".markdown-body",
    ".Layout-sidebar p",
    "div > span.search-match",
    "li.repo-list-item p",
    "#responsive-meta-container p",
    "article p",
    "feed-container article ul li a span",
    "feed-container article .FormControl-caption",
    "div.repo-description p",
    "[itemprop='description']",
    ".integrations-auth-wrapper",
    ".new-feed-onboarding-notice",
    "article section[aria-label='card content'] > div > div > div > div:nth-child(2)",
    ".js-notice h2",
    ".js-notice p",
    ".TimelineItem-body a span",
    ".TimelineItem-body a div",
    "[data-testid='commit-row-item'] h4",
    ".font-mktg",
    ".search-title",
    ".search-match",
    ".pinned-item-desc",
    "#repo-content-turbo-frame .markdown-title",
    "[app-name='blackbird-search'] [data-hpc='true']",
    ".topic-box > a > p:nth-of-type(2)",
    "[data-testid='listitem-title-link']",
    "#repo-content-turbo-frame p",
    "#repo-content-turbo-frame h4",
    "[aria-label='card content'] .flex-column > div:nth-child(2)",
    "[class*='TitleHeader']",
    ".bpDald",
    ".discussion-title",
    ".copilotPreview__footer",
    ".heading-element",
    ".js-feed-item-component h3 a[data-hovercard-type='pull_request']",
    "[data-testid='issue-pr-title-link']",
    "div.user-profile-bio",
    "div.news > div.js-notice",
    "#memex-project-view-root a [class^='prc-Text-Text']",
    "[class^='OverviewContent'] [class*='DirectoryRichtextContent']",
    "[id^='pullrequestreview']",
    "[class^='ChatMessage']",
    "[class*='prc-FormControl'] > [class*='prc-Text']",
    "[class*='prc-FormControl'] [class*='prc-FormControl-LabelContainer'] [class*='prc-Text']",
    "[data-testid='beginners-playlist-section']",
    "[data-testid='getting-started-checklist-section']",
    "[data-testid='docs-section']",
    "[data-testid='recommendations-section']",
    ".feed-item-content section[data-view-component] [class='flex-1 d-flex flex-column'] div:nth-child(2)",
    "#org-new-form",
    ".trial-info-large",
    ".dfd-trial__container-form",
    "dialog-helper",
    ".blankslate-heading",
    ".activity-overview-box",
    "#spaces-list",
    "[class*='ContentView-module__serviceDescription']",
    ".BannerDescription",
    "copilot-user-settings",
    "h2:has(~ copilot-user-settings)",
    "div:has(~ copilot-user-settings)",
    "[class='f4 color-fg-muted col-md-6 mx-auto']",
    "[class='col-lg-9 position-relative pr-lg-5 mb-6 mr-lg-5']",
    "[class*='IssueIndexPage-module__middlePaneGrid'] div[class='p-4 text-center rounded-2 border color-border-muted']",
    "[class*='ModelsPlaygroundRoute-module__playgroundContainer']",
    "article [class='f6 color-fg-muted mt-1']",
  ];
  const GITHUB_CONTENT_SELECTOR = GITHUB_CONTENT_SELECTORS.join(",");
  const ADDITIONAL_CONTENT_SELECTOR = [
    "h1",
    "section h2",
    "section h3",
    "section h4",
    "main h2",
    "main h3",
    "main h4",
    ".article-title",
    ".article-subtitle",
    ".article_title",
    ".article_subtitle",
    ".article__title",
    ".articleTitle",
    ".Article__content",
    ".titleLink",
    ".summary",
    ".headline",
    ".page-content",
    "aside.note",
    "aside.article-comments",
    "aside.onebox",
  ].join(",");
  const GITHUB_EXCLUDED_PATH_PATTERNS = [
    /^\/[^/]+\/[^/]+\/settings(?:\/|$)/,
    /^\/settings(?:\/|$)/,
    /^\/sponsors(?:\/|$)/,
    /^\/readme(?:\/|$)/,
    /^\/features(?:\/|$)/,
    /^\/codespaces(?:\/|$)/,
    /^\/customer-stories(?:\/|$)/,
    /^\/signup\/?$/,
    /^\/login\/?$/,
    /^\/marketplace(?:\/|$)/,
    /^\/github-copilot(?:\/|$)/,
    /^\/collections(?:\/|$)/,
    /^\/resources\/events(?:\/|$)/,
    /^\/pricing(?:\/|$)/,
  ];
  const STAY_ORIGINAL_SELECTOR = [
    "code",
    "tt",
    "g-emoji",
    "img",
    "sup",
    "sub",
    "samp",
    "math",
    "semantics",
    "mrow",
    "mo",
    "mfrac",
    "msup",
    "mi",
    "mn",
    "msqrt",
    "d-math",
    "span.katex",
    ".math-block",
    ".MathJax_Preview",
    ".MathJax_Display",
    ".math-container",
    ".MathJax",
    ".MathJax_SVG",
    "math-renderer",
    "[aria-labelledby^='MathJax-SVG']",
    ".mwe-math-element",
    "em[translate='no']",
    "code[translate='no']",
    "a[translate='no']",
    "b[translate='no']",
    "span.math.inline",
    "span.math.display",
    ".ltx_Math",
    ".mathjax-block",
    ".MathJax_CHTML",
    "kbd",
    "span.pretex-inline",
    "span.math-inline",
    ".reference-citations",
    ".code",
    "[data-test='json-editor']",
    ".jp-CodeMirrorEditor",
    "cds-code-snippet",
    ".interactive-markdown__code",
    "span.variable[translate='no']",
    "#ace-editor",
    "table.processedcode",
    ".issue-link",
  ].join(",");
  const EXCLUDE_SELECTOR = [
    ...COMMON_EXCLUDE_SELECTORS,
    ...(location.hostname === "github.com" ? GITHUB_EXCLUDE_SELECTORS : []),
  ].join(",");
  const MUTATION_EXCLUDE_SELECTOR = [
    "span.highlighter--highlighted",
    "span.highlighter-ext",
    "mark",
    "msreadoutspan",
    "rw-highlight",
    "web-highlight",
    "pre",
    ".uacc-clickable",
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
    if (isExcludedSitePage()) {
      throw new Error("No translatable main content was found");
    }

    const contentRoots = findContentRoots();
    const paragraphs = findParagraphs(contentRoots);
    if (paragraphs.length === 0) {
      throw new Error("No translatable main content was found");
    }

    const session = {
      run,
      sourceLanguage,
      targetLanguage,
      contentRoots,
      paragraphs: [],
      groups: new Map(),
      seenAnchors: new Map(),
      queued: new Set(),
      flushTimer: null,
      observer: null,
      mutationObserver: null,
      mutationTimer: null,
      dirtyRoots: new Set(),
      recomputeContentRoots: false,
      requestSequence: 0,
    };
    activeTranslationSession = session;

    for (const paragraph of paragraphs) {
      registerParagraph(session, paragraph);
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
    observePageChanges(session);
    return session.paragraphs.length;
  }

  function isExcludedSitePage() {
    return (
      location.hostname === "github.com" &&
      GITHUB_EXCLUDED_PATH_PATTERNS.some((pattern) =>
        pattern.test(location.pathname),
      )
    );
  }

  function stopTranslationSession() {
    const session = activeTranslationSession;
    if (!session) {
      return;
    }
    session.observer?.disconnect();
    session.mutationObserver?.disconnect();
    if (session.flushTimer) {
      clearTimeout(session.flushTimer);
    }
    if (session.mutationTimer) {
      clearTimeout(session.mutationTimer);
    }
    session.paragraphs.forEach(removeLoading);
    session.queued.clear();
    activeTranslationSession = null;
  }

  function observePageChanges(session) {
    session.mutationObserver = new MutationObserver((mutations) => {
      if (activeTranslationSession !== session) {
        return;
      }
      const pageMutations = mutations.filter(isPageContentMutation);
      if (pageMutations.length === 0) {
        return;
      }
      markDirtyRoots(session, pageMutations);
      if (session.mutationTimer) {
        return;
      }
      session.mutationTimer = setTimeout(() => {
        session.mutationTimer = null;
        refreshSessionParagraphs(session);
      }, 100);
    });
    session.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "hidden",
        "aria-hidden",
        "translate",
        "contenteditable",
        "role",
      ],
    });
  }

  function markDirtyRoots(session, mutations) {
    for (const mutation of mutations) {
      const target =
        mutation.target.nodeType === Node.ELEMENT_NODE
          ? mutation.target
          : mutation.target.parentElement;
      if (target) {
        for (const root of session.contentRoots) {
          if (
            root === target ||
            root.contains(target) ||
            target.contains(root)
          ) {
            session.dirtyRoots.add(root);
          }
        }
        if (mutation.type === "attributes") {
          const revealedRoots =
            location.hostname === "github.com"
              ? findSiteRuleRoots(target)
              : findAdditionalContentRoots(target);
          for (const root of revealedRoots) {
            if (!session.contentRoots.includes(root)) {
              session.contentRoots.push(root);
            }
            session.dirtyRoots.add(root);
          }
          if (
            location.hostname !== "github.com" &&
            !session.contentRoots.some((root) => root.contains(target)) &&
            target.matches("article, main, [role='main']")
          ) {
            session.recomputeContentRoots = true;
          }
        }
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        const addedRoots =
          location.hostname === "github.com"
            ? findSiteRuleRoots(node)
            : findAdditionalContentRoots(node);
        for (const root of addedRoots) {
          if (!session.contentRoots.includes(root)) {
            session.contentRoots.push(root);
          }
          session.dirtyRoots.add(root);
        }
        if (
          location.hostname !== "github.com" &&
          !session.contentRoots.some((root) => root.contains(node)) &&
          (node.matches("article, main, [role='main']") ||
            node.querySelector("article, main, [role='main']"))
        ) {
          session.recomputeContentRoots = true;
        }
      }
    }
  }

  function isPageContentMutation(mutation) {
    const target =
      mutation.target.nodeType === Node.ELEMENT_NODE
        ? mutation.target
        : mutation.target.parentElement;
    if (target?.closest?.(MUTATION_EXCLUDE_SELECTOR)) {
      return false;
    }
    if (mutation.type === "characterData" || mutation.type === "attributes") {
      return !isTranslatorNode(mutation.target);
    }
    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
    const changedElements = changedNodes.filter(
      (node) => node.nodeType === Node.ELEMENT_NODE,
    );
    if (
      changedElements.length > 0 &&
      changedElements.every(isMutationExcludedNode)
    ) {
      return false;
    }
    return changedNodes.some((node) => !isTranslatorNode(node));
  }

  function isMutationExcludedNode(node) {
    const element =
      node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(
      element?.matches?.(MUTATION_EXCLUDE_SELECTOR) ||
        element?.closest?.(MUTATION_EXCLUDE_SELECTOR),
    );
  }

  function isTranslatorNode(node) {
    const element =
      node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(
      element?.matches?.(
        `.${TRANSLATION_CLASS}, .${LOADING_CLASS}, .${ERROR_CLASS}`,
      ) ||
        element?.closest?.(
          `.${TRANSLATION_CLASS}, .${LOADING_CLASS}, .${ERROR_CLASS}`,
        ),
    );
  }

  function refreshSessionParagraphs(session) {
    if (activeTranslationSession !== session) {
      return;
    }
    if (isExcludedSitePage()) {
      stopTranslationSession();
      document
        .querySelectorAll(
          `.${TRANSLATION_CLASS}, .${LOADING_CLASS}, .${ERROR_CLASS}`,
        )
        .forEach((element) => element.remove());
      return;
    }

    for (const [anchor, paragraph] of session.seenAnchors) {
      if (anchor.isConnected) {
        continue;
      }
      unregisterParagraph(session, paragraph);
    }

    const roots = takeDirtyRoots(session);
    if (roots.length === 0) {
      return;
    }
    const discoveredParagraphs = findParagraphs(roots);
    const discoveredAnchors = new Set(
      discoveredParagraphs.map((paragraph) => paragraph.anchor),
    );
    for (const [anchor, paragraph] of session.seenAnchors) {
      if (
        roots.some((root) => root.contains(anchor)) &&
        !discoveredAnchors.has(anchor)
      ) {
        unregisterParagraph(session, paragraph);
      }
    }
    for (const paragraph of discoveredParagraphs) {
      const existing = session.seenAnchors.get(paragraph.anchor);
      if (existing) {
        if (!isSameTranslationInput(existing.input, paragraph.input)) {
          removeLoading(existing);
          removeError(existing);
          existing.translationElement?.remove();
          existing.translationElement = null;
          existing.input = paragraph.input;
          existing.status = "observed";
          observeParagraph(session, existing);
        }
        continue;
      }
      if (registerParagraph(session, paragraph)) {
        observeParagraph(session, paragraph);
      }
    }
  }

  function isSameTranslationInput(left, right) {
    return (
      left.text === right.text &&
      left.originals.length === right.originals.length &&
      left.originals.every(
        (original, index) => original.text === right.originals[index].text,
      )
    );
  }

  function takeDirtyRoots(session) {
    if (session.recomputeContentRoots) {
      session.recomputeContentRoots = false;
      session.dirtyRoots.clear();
      session.contentRoots = findContentRoots();
      return session.contentRoots;
    }
    session.contentRoots = session.contentRoots.filter(
      (root) => root.isConnected,
    );
    const roots = [...session.dirtyRoots].filter((root) => root.isConnected);
    session.dirtyRoots.clear();
    if (roots.length > 0) {
      return roots;
    }
    if (session.contentRoots.length === 0) {
      session.contentRoots = findContentRoots();
      return session.contentRoots;
    }
    return [];
  }

  function registerParagraph(session, paragraph) {
    const target =
      paragraph.container instanceof Element
        ? paragraph.container
        : paragraph.anchor.parentElement;
    if (!target?.isConnected || session.seenAnchors.has(paragraph.anchor)) {
      return false;
    }
    paragraph.status = "observed";
    paragraph.visibilityTarget = target;
    session.paragraphs.push(paragraph);
    session.seenAnchors.set(paragraph.anchor, paragraph);
    const group = session.groups.get(target) || [];
    group.push(paragraph);
    session.groups.set(target, group);
    return true;
  }

  function unregisterParagraph(session, paragraph) {
    removeLoading(paragraph);
    removeError(paragraph);
    paragraph.translationElement?.remove();
    session.queued.delete(paragraph);
    session.seenAnchors.delete(paragraph.anchor);
    const index = session.paragraphs.indexOf(paragraph);
    if (index >= 0) {
      session.paragraphs.splice(index, 1);
    }
    const group = session.groups.get(paragraph.visibilityTarget);
    if (group) {
      const groupIndex = group.indexOf(paragraph);
      if (groupIndex >= 0) {
        group.splice(groupIndex, 1);
      }
      if (group.length === 0) {
        session.groups.delete(paragraph.visibilityTarget);
        session.observer?.unobserve(paragraph.visibilityTarget);
      }
    }
    paragraph.status = "detached";
  }

  function observeParagraph(session, paragraph) {
    const target = paragraph.visibilityTarget;
    if (!target?.isConnected) {
      return;
    }
    if (session.observer) {
      session.observer.observe(target);
    } else {
      queueParagraphs(session, [paragraph]);
    }
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
      const requestId = ++session.requestSequence;
      paragraphs.forEach((paragraph) => {
        paragraph.requestId = requestId;
        paragraph.status = "translating";
        showLoading(paragraph, session.targetLanguage);
      });
      void translateParagraphBatch(session, paragraphs, requestId).catch(
        (error) => {
          showBatchError(session, paragraphs, requestId, error);
        },
      );
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

  function showBatchError(session, paragraphs, requestId, error) {
    if (
      activeTranslationSession !== session ||
      session.run !== translationRun
    ) {
      return;
    }
    paragraphs.forEach((paragraph) => {
      if (
        paragraph.requestId !== requestId ||
        paragraph.status !== "translating"
      ) {
        return;
      }
      removeLoading(paragraph);
      paragraph.status = "error";
      showError(session, paragraph, error);
    });
  }

  async function translateParagraphBatch(session, paragraphs, requestId) {
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
      if (
        paragraph.requestId !== requestId ||
        paragraph.status !== "translating"
      ) {
        return;
      }
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
      paragraph.translationElement = translation;
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

  function findContentRoots() {
    const forcedRoots = findSiteRuleRoots();
    if (forcedRoots.length > 0) {
      return forcedRoots;
    }
    const readabilityRoot = findReadabilityRoot();
    if (!readabilityRoot) {
      return [document.body];
    }
    return [
      ...new Set([readabilityRoot, ...findAdditionalContentRoots()]),
    ];
  }

  function findParagraphs(roots = findContentRoots()) {
    const paragraphs = [];
    const seen = new Set();

    for (const root of roots) {
      if (isInsideExcludedElement(root)) {
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

  function findSiteRuleRoots(scope = document) {
    if (location.hostname !== "github.com") {
      return [];
    }

    const roots = new Set();
    try {
      if (scope instanceof Element && scope.matches(GITHUB_CONTENT_SELECTOR)) {
        roots.add(scope);
      }
      scope
        .querySelectorAll(GITHUB_CONTENT_SELECTOR)
        .forEach((element) => roots.add(element));
    } catch {
      return [];
    }
    return [...roots].filter(
      (element) =>
        element.getClientRects().length > 0 &&
        !isHidden(element) &&
        !isInsideExcludedElement(element),
    );
  }

  function findAdditionalContentRoots(scope = document) {
    const roots = new Set();
    try {
      if (scope instanceof Element && scope.matches(ADDITIONAL_CONTENT_SELECTOR)) {
        roots.add(scope);
      }
      scope
        .querySelectorAll(ADDITIONAL_CONTENT_SELECTOR)
        .forEach((element) => roots.add(element));
    } catch {
      return [];
    }
    return [...roots].filter(
      (element) =>
        element.getClientRects().length > 0 &&
        !isHidden(element) &&
        !isInsideExcludedElement(element),
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
        (isExcludedElement(element) && !stayOriginal) ||
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
    if (element.matches(EXTRA_INLINE_SELECTOR)) {
      return false;
    }

    if (element.matches(EXTRA_BLOCK_SELECTOR) || element.tagName === "INPUT") {
      return true;
    }
    if (
      getComputedStyle(element.parentElement || element).display === "inline-flex"
    ) {
      return false;
    }
    const isBlock = style.display
      ? !INLINE_DISPLAYS.has(style.display)
      : element.matches(FALLBACK_BLOCK_SELECTOR);
    return isBlock && !element.matches(ATOMIC_BLOCK_SELECTOR);
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
      if (isTranslatorNode(next)) {
        break;
      }
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

  function isExcludedElement(element) {
    return element.matches(EXCLUDE_SELECTOR);
  }

  function isInsideExcludedElement(element) {
    return Boolean(element.closest?.(EXCLUDE_SELECTOR));
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
