import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";

const statusPath = process.argv[2] ?? "data/status.json";
const outputDir = process.argv[3] ?? "site";

const fallbackStatus = {
  event: {
    performer: "David Tennant",
    show: "White Rabbit Red Rabbit",
    venue: "Duchess Theatre, London",
    performanceLocal: "2026-06-15T19:30:00+01:00",
    timeZone: "Europe/London"
  },
  overall: "check_error",
  checkedAt: null,
  checkedAtLondon: "Not checked yet",
  sources: []
};

await mkdir(outputDir, { recursive: true });
await copyFile("public/index.html", `${outputDir}/index.html`);
await copyFile("public/styles.css", `${outputDir}/styles.css`);
await copyFile("public/app.js", `${outputDir}/app.js`);

let status = fallbackStatus;
try {
  status = JSON.parse(await readFile(statusPath, "utf8"));
} catch {
  // The first deployment can still publish the site before a check succeeds.
}

await writeFile(`${outputDir}/status.json`, `${JSON.stringify(status, null, 2)}\n`);
console.log(`Built ${outputDir}`);
