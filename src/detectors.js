const SOLD_OUT_RE = /\b(sold\s*out|currently\s*unavailable|no\s*tickets|not\s*available|unavailable|fully\s*booked)\b/i;
const TICKET_RE = /\b(buy\s*tickets?|get\s*tickets?|select\s+(?:seats?|tickets?)|choose\s+(?:seats?|tickets?)|available\s*(?:tickets?|seats?)|tickets?\s*available|add\s*to\s*basket|checkout)\b/i;
const TARGET_RE = /david\s+tennant|15\s+(?:jun|june)|jun(?:e)?\s+15|2026-06-15|duchess\s+theatre/i;
const PRICE_RE = /(?:£|GBP\s*)\s?\d+(?:\.\d{2})?/gi;
const QUANTITY_RE = /\b\d+\s+(?:tickets?|seats?)\b/gi;

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function detectAvailability(source, pageText) {
  const text = compact(pageText);
  const lower = text.toLowerCase();
  const prices = [...new Set(text.match(PRICE_RE) ?? [])].slice(0, 5);
  const quantities = [...new Set(text.match(QUANTITY_RE) ?? [])].slice(0, 5);
  const hasTicketSignal = TICKET_RE.test(text);
  const hasSoldOutSignal = SOLD_OUT_RE.test(text);
  const hasTargetSignal = TARGET_RE.test(text) || source.id === "nimax-official";

  let available = false;
  let confidence = "low";
  const notes = [];

  if (hasSoldOutSignal) {
    notes.push("Sold-out or unavailable wording was visible.");
  }

  if (source.id === "nimax-official") {
    available = hasTicketSignal && !hasSoldOutSignal;
    confidence = available ? "medium" : "low";
    notes.push("Nimax official page was checked for explicit purchase or seat-selection wording.");
  } else if (source.id === "todaytix") {
    const appOnlyGeneralListing = lower.includes("app only") && lower.includes("selling out");
    available = hasTicketSignal && hasTargetSignal && !hasSoldOutSignal && !appOnlyGeneralListing;
    confidence = available ? "medium" : "low";
    notes.push("TodayTix is only treated as available if the page shows explicit ticket action for the target event.");
  } else if (source.id === "twickets") {
    available = hasTicketSignal && hasTargetSignal && !hasSoldOutSignal;
    confidence = available ? "medium" : "low";
    notes.push("Twickets is only treated as available when resale/ticket wording appears with the target show/date context.");
  }

  return {
    available,
    confidence,
    prices,
    quantities,
    notes,
    excerpt: text.slice(0, 500)
  };
}
