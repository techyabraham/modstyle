# Accessibility check record

Last automated and keyboard-only browser check: 1 October 2026. Browser coverage is Chromium at 360×800, 768×1024 and 1440×900.

## Keyboard walkthrough

The Playwright preview suite (`tests/e2e/preview.spec.ts`) sends keyboard input without mouse interaction for these checks:

- Tab reaches the visible skip link; Enter follows it to `#main`, then Shift+Tab returns to the header enquiry link.
- Enter opens the native basket dialog.
- Escape closes the dialog and restores focus to its trigger.
- On a product page, Tab reaches the image viewer button; Enter opens the lightbox, Escape closes it and returns focus to the image button.
- Native FAQ `details` controls remain keyboard operable. Product and gallery lightbox focus/keyboard behavior is also covered by the preview journey tests.

Production and preview browser checks run at mobile, tablet and desktop viewports. They check keyboard focus, reduced motion, no horizontal overflow, and serious/critical axe violations. The `@a11y` suite checks the production shell, supporting pages, enquiry forms and open basket. The production shell also has a no-JavaScript WhatsApp fallback check.

## Release check

Run `pnpm check` and `pnpm build && pnpm test:preview`. Both commands must pass. `pnpm check` includes axe-core checks and production-mode route checks; `pnpm test:preview` covers the published product/gallery interactions and responsive menu. Re-run after changes to navigation, dialogs, forms, focus styles or motion.

Automated Chromium and keyboard tests do not replace a screen-reader or browser/OS accessibility review. Before launch, have a person test current Chrome/Edge with NVDA and a current mobile screen reader, paying particular attention to product images, form error announcements, native dialogs and the empty/persisted basket states. Record any follow-up with the browser, assistive technology and route tested.
