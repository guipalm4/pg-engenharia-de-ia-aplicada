Playwright-only setup (with CI)

Goal: Set up Playwright to test the app at:
https://erickwendel.github.io/vanilla-js-web-app-example/

What to include
- Install only Playwright test runner (no extra frameworks)
- Configure baseURL and a reasonable timeout (at most 5 seconds)
- Create a tests/ directory and a first spec using @playwright/test
- CI: GitHub Actions workflow that installs and runs only Chromium

Local setup
1) Install dev dependency
	- npm i -D @playwright/test

2) Install only Chromium browser binaries (smaller and faster)
	- npx playwright install --with-deps chromium

GitHub Actions (Chromium only)
- Create .github/workflows/playwright.yml with a job that:
  - Checks out the repo
  - Sets up Node.js
  - Runs npm ci
  - Runs npx playwright install --with-deps chromium
  - Runs npm test
  - Uploads the HTML report as an artifact on failure
