import { event } from "./config.js";

const now = process.env.CHECK_NOW ? new Date(process.env.CHECK_NOW) : new Date();
const finalWeekStart = new Date(event.finalWeekStartLocal);
const performance = new Date(event.performanceLocal);
const eventName = process.env.GITHUB_EVENT_NAME ?? "";

if (eventName === "workflow_dispatch") {
  console.log("Manual run requested.");
  process.exit(0);
}

if (now > performance) {
  console.log("Performance time has passed. Skipping check.");
  process.exit(78);
}

if (now >= finalWeekStart) {
  console.log("Final week: hourly checks are enabled.");
  process.exit(0);
}

if (now.getUTCHours() % 8 === 0) {
  console.log("Pre-final-week 8-hour check window.");
  process.exit(0);
}

console.log("Not an 8-hour check window yet. Skipping.");
process.exit(78);
