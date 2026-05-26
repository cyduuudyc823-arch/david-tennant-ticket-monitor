import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { event, sources, statusPath } from "./config.js";
import { detectAvailability } from "./detectors.js";

function londonTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: event.timeZone
  }).format(date);
}

async function pageText(page) {
  return page.locator("body").innerText({ timeout: 10000 });
}

async function checkSource(browser, source) {
  const page = await browser.newPage({
    viewport: { width: 1365, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
  });

  try {
    await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    const text = await pageText(page);
    const detection = detectAvailability(source, text);

    return {
      id: source.id,
      name: source.name,
      kind: source.kind,
      url: source.url,
      checked: true,
      status: detection.available ? "tickets_found" : "no_trusted_tickets",
      ...detection
    };
  } catch (error) {
    return {
      id: source.id,
      name: source.name,
      kind: source.kind,
      url: source.url,
      checked: false,
      status: "check_error",
      available: false,
      confidence: "none",
      prices: [],
      quantities: [],
      notes: [error.message],
      excerpt: ""
    };
  } finally {
    await page.close();
  }
}

export async function runCheck() {
  const checkedAt = new Date();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const results = [];
    for (const source of sources) {
      results.push(await checkSource(browser, source));
    }

    const anyAvailable = results.some((result) => result.available);
    const anyErrors = results.some((result) => result.status === "check_error");
    const overall = anyAvailable ? "tickets_found" : anyErrors ? "check_error" : "no_trusted_tickets";

    return {
      event,
      overall,
      checkedAt: checkedAt.toISOString(),
      checkedAtLondon: londonTime(checkedAt),
      sources: results
    };
  } catch (error) {
    return {
      event,
      overall: "check_error",
      checkedAt: checkedAt.toISOString(),
      checkedAtLondon: londonTime(checkedAt),
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        kind: source.kind,
        url: source.url,
        checked: false,
        status: "check_error",
        available: false,
        confidence: "none",
        prices: [],
        quantities: [],
        notes: [`Browser/check setup failed: ${error.message}`],
        excerpt: ""
      }))
    };
  } finally {
    await browser?.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputPath = process.argv[2] ?? statusPath;
  const status = await runCheck();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(status, null, 2)}\n`);
  console.log(`Wrote ${outputPath}: ${status.overall}`);
}
