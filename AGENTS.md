# Minimal Translator repository architecture

- `manifest.json`: Manifest V3 permissions and entry points.
- `popup.html`, `popup.js`: source/target settings and the translate action.
- `vendor/Readability.js`: unmodified Mozilla Readability 0.6.0 source.
- `vendor/Readability.LICENSE.md`: Apache-2.0 license for Readability.
- `vendor/Apache-2.0.txt`: full Apache-2.0 license text.
- `content.js`: Readability/live-DOM mapping, source-aligned DOM rules, the GitHub site rule, mutation-driven rescanning, viewport scheduling, progressive request batching, paragraph loading/retry state, protected inline text, and translated-text insertion.
- `background.js`: batched requests to the fixed Google Translate endpoint.
- `README.md`: installation, usage, and the translation-service privacy note.

Keep the extension package-manager-free and build-free. Preserve the single workflow: user action, main-content scan, Google translation, and translated text below each source block.
