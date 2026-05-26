import { readFile } from "node:fs/promises";

const currentPath = process.argv[2] ?? "data/status.json";
const previousUrl = process.argv[3] || process.env.PREVIOUS_STATUS_URL || "";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchPrevious(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function hasTickets(status) {
  return status?.overall === "tickets_found" || status?.sources?.some((source) => source.available);
}

function ticketSummary(status) {
  const available = status.sources.filter((source) => source.available);
  const lines = [
    `发现可信票源：${status.event.performer}《${status.event.show}》`,
    `场次：${status.event.performanceLocal}，${status.event.venue}`,
    `检查时间：${status.checkedAtLondon}`
  ];

  for (const source of available) {
    const price = source.prices.length ? source.prices.join(", ") : "页面未显示明确价格";
    const qty = source.quantities.length ? source.quantities.join(", ") : "页面未显示明确数量/座位";
    lines.push(`${source.name}: ${source.url}`);
    lines.push(`价格：${price}`);
    lines.push(`票数/座位：${qty}`);
    lines.push(`风险提示：${source.kind === "official" ? "官方票源" : "转售/第三方票源，请确认入场和转让规则"}`);
  }

  return lines.join("\n");
}

const current = await readJson(currentPath);
const previous = await fetchPrevious(previousUrl);

if (!hasTickets(current)) {
  console.log("No trusted tickets found. Notification skipped.");
  process.exit(0);
}

if (hasTickets(previous)) {
  console.log("Tickets were already present in previous status. Notification skipped.");
  process.exit(0);
}

const topic = process.env.NTFY_TOPIC;
const server = process.env.NTFY_SERVER || "https://ntfy.sh";

if (!topic) {
  console.log("NTFY_TOPIC is not set. Would have sent:");
  console.log(ticketSummary(current));
  process.exit(0);
}

const response = await fetch(`${server.replace(/\/$/, "")}/${encodeURIComponent(topic)}`, {
  method: "POST",
  headers: {
    Title: "David Tennant tickets found",
    Priority: "urgent",
    Tags: "tickets"
  },
  body: ticketSummary(current)
});

if (!response.ok) {
  throw new Error(`ntfy failed with ${response.status}: ${await response.text()}`);
}

console.log("ntfy notification sent.");
