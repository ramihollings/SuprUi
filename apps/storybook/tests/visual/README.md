# Visual regression — Storybook screenshots

Screenshot baselines for all 10 web components, in dark and light themes,
against the built Storybook. Chromium only, headless (Milestone 2, D11).

## Coverage

One baseline per component per theme, plus cheap open-state variants:

| Baseline | Story | Notes |
| --- | --- | --- |
| `avatar-all-sizes-{dark,light}` | Avatar — All Sizes | Fallback initials only; no network image |
| `button-all-variants-{dark,light}` | Button — All Variants | All 5 variants |
| `card-playground-{dark,light}` | Card — Playground | |
| `dialog-open-{dark,light}` | Dialog — Open | Mounted open; Motion settle polled |
| `input-playground-{dark,light}` | Input — Playground | |
| `input-with-error-{dark,light}` | Input — With Error | Error state + message |
| `popover-open-{dark,light}` | Popover — Playground | Trigger clicked open |
| `select-with-value-{dark,light}` | Select — With Value | Closed, value shown |
| `select-open-{dark,light}` | Select — With Value | Trigger clicked, options listed |
| `switch-checked-{dark,light}` | Switch — Checked | |
| `switch-playground-{dark,light}` | Switch — Playground | Unchecked |
| `tabs-playground-{dark,light}` | Tabs — Playground | |
| `toast-all-variants-{dark,light}` | Toast — All Variants | All four variants fired |

26 baselines total (13 cases × 2 themes). Baselines live in
`__snapshots__/` next to `visual.spec.ts`.

## Run

```bash
# from apps/storybook (build Storybook first if stories changed)
npm run build-storybook
npm run test:visual        # visual suite only
npm test                   # smoke + visual
```

The suite loads each story directly in the preview iframe
(`/iframe.html?id=…&globals=theme:…`), bypassing the manager UI, and
asserts the page actually shows the requested theme before
screenshotting. The viewport is fixed at 1280×720. Motion enter
animations are settled by polling rendered opacity (no fixed waits);
CSS transitions are frozen at their end state by
`animations: "disabled"`.

## Update baselines

After an **intentional** visual change, regenerate the affected
baselines and review the diff before committing — a baseline diff is
the test telling you something changed, not noise to rubber-stamp:

```bash
# from apps/storybook
npx playwright test tests/visual --update-snapshots
```

Then run the suite once more without the flag to confirm it passes
against the new baselines, and commit the changed PNGs with the change
that caused them.

## Notes

- **Chromium only.** Baselines are screenshots from the cached headless
  Chromium build (`~/.cache/ms-playwright`). After a Playwright upgrade,
  re-run with `--update-snapshots` if rendering shifts, and review the
  diffs.
- **No cross-browser matrix** in this suite (D11: Playwright is web-only;
  Android e2e is a follow-up). Adding Firefox/WebKit projects would need
  their own baselines per browser.
- **What is not covered:** interaction states beyond the open states
  above (hover, focus, keyboard navigation), responsive widths, and the
  native (`@suprui/ui-native`) components — Storybook is web-only.
- **Flakiness seen so far:** none. The known risks are font loading
  (mitigated by waiting on `document.fonts.ready`) and toast auto-dismiss
  (Base UI default timeout; the test fires all four toasts and screenshots
  immediately after their enter animations settle).
