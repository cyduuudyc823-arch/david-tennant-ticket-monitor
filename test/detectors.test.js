import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { detectAvailability } from "../src/detectors.js";

const source = {
  id: "nimax-official",
  name: "Nimax official ticketing",
  kind: "official"
};

test("detects explicit ticket availability", async () => {
  const html = await readFile("test/fixtures/available.html", "utf8");
  const result = detectAvailability(source, html);

  assert.equal(result.available, true);
  assert.deepEqual(result.prices, ["£50"]);
  assert.deepEqual(result.quantities, ["2 seats"]);
});

test("does not treat sold-out wording as available", async () => {
  const html = await readFile("test/fixtures/sold-out.html", "utf8");
  const result = detectAvailability(source, html);

  assert.equal(result.available, false);
});
