# Playwright TodoMVC Example

A small, runnable Playwright test suite that exercises the public TodoMVC demo
(https://demo.playwright.dev/todomvc/) across **Chromium, Firefox, and WebKit**.

## Prerequisites (user-level setup)

This machine was set up so Playwright works **globally**, not per-project:

```powershell
npm install -g @playwright/test     # test runner + CLI
playwright install                  # browsers -> %USERPROFILE%\AppData\Local\ms-playwright
```

Because the runner is global, test files resolve `@playwright/test` through the
user-level `NODE_PATH`:

```powershell
# Persistent (User) environment variable
[Environment]::SetEnvironmentVariable('NODE_PATH','C:\nvm4w\nodejs\node_modules','User')
```

> Restart your shell after setting `NODE_PATH`, then `playwright test` works from
> any folder without a local `node_modules`.

## Run the tests

```powershell
# From this folder
playwright test                 # all browsers
playwright test --project=chromium
playwright test --headed        # watch it happen
playwright test --ui            # interactive UI mode
playwright show-report          # open the HTML report
```

## Continuous Integration

The workflow at `.github/workflows/playwright.yml` runs the suite on every push
and pull request:

- Node 22, `npm ci` for reproducible installs
- Caches `~/.cache/ms-playwright` keyed on `package-lock.json`
- Runs `npx playwright test` across Chromium, Firefox, and WebKit
- Uploads the HTML report (always) and `test-results/` traces (on failure)

> **Root caveat:** GitHub only reads workflows from the **repository root**
> `.github/workflows/`. This file works when this example folder is its own
> repository; if it lives inside a larger repo, move the workflow to that repo's
> root `.github/workflows/`.

## What the tests cover

| Test | Verifies |
|---|---|
| `starts with an empty todo list` | Empty state (input visible, no items, footer hidden) |
| `can add a single todo` | Create + counter shows "1 item left" |
| `can add multiple todos` | Adding several items + counter |
| `can complete a todo` | Toggle completion + "0 items left" |
| `can filter active vs completed` | Active / Completed / All filters (visibility-based) |
| `can delete a todo` | Hover + delete |
| `can clear completed todos` | "Clear completed" removes done items |

## Files

```text
playwright-todo/
├── package.json
├── playwright.config.ts        # browsers, tracing, baseURL
├── tests/
│   └── todo.spec.ts            # 7 E2E tests
└── README.md
```

## Notes

- `baseURL` is the **origin** (`https://demo.playwright.dev`); tests navigate to
  `/todomvc/`.
- Todos are selected with `getByTestId('todo-item')` — `getByRole('listitem')`
  would also match the footer's filter `<li>` elements.
- The footer is not rendered while the list is empty.
- Filtering hides items with CSS (they stay in the DOM), so the filter test
  asserts **visibility**, not count.
