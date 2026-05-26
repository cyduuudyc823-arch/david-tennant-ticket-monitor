# David Tennant Ticket Monitor

Public GitHub Pages site plus GitHub Actions checker for David Tennant's *White Rabbit Red Rabbit* performance at Duchess Theatre, London, 15 June 2026 at 19:30.

The monitor checks trusted public sources only:

- Nimax official ticketing/show pages
- TodayTix show page
- Twickets results for the exact show/date context

It does not log in, buy tickets, enter checkout, handle queues, solve captchas, or bypass anti-bot protections.

## How it works

- `src/check.js` uses Playwright to open each source and write `data/status.json`.
- `src/notify.js` sends an ntfy alert only when the new status has tickets and the previously deployed `status.json` did not.
- `src/build-site.js` publishes a static site to `site/`.
- `.github/workflows/check-and-deploy.yml` runs the monitor and deploys GitHub Pages.

## Schedule

GitHub Actions cannot express one-off end dates perfectly in cron, so the workflow runs on cron and `src/should-run.js` decides whether to continue.

- Before 8 June 2026 19:30 London time: checks every 8 hours.
- From 8 June 2026 19:30 to 15 June 2026 19:30 London time: checks hourly.
- After the performance time: scheduled runs exit early.
- Manual runs are available from the GitHub Actions tab.

## Setup on GitHub

1. Create a new **public** GitHub repository.
2. Upload or push these files to the repository.
3. In repository settings, enable GitHub Pages with source **GitHub Actions**.
4. Add repository secret `NTFY_TOPIC`.
   - Use a random topic name, for example `wrrr-dt-` plus a long random string.
   - Subscribe to that topic in the ntfy mobile app or at `https://ntfy.sh`.
5. Optional: add repository secret `NTFY_SERVER`. If omitted, the workflow uses `https://ntfy.sh`.
6. Open the Actions tab and run **Check tickets and deploy site** manually once.

The site URL will usually be:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

## Local commands

Install dependencies:

```sh
npm install
npx playwright install chromium
```

Run fixture tests:

```sh
npm test
```

Run a live check:

```sh
npm run check
```

Build the website locally:

```sh
npm run build
```

## Notes

This repository is designed to be public. Do not commit notification topics, API keys, email credentials, or personal details. Put secrets in GitHub repository secrets.
