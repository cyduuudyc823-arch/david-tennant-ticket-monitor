const topic = process.env.NTFY_TOPIC;
const server = process.env.NTFY_SERVER || "https://ntfy.sh";

if (!topic) {
  throw new Error("NTFY_TOPIC is not set.");
}

const checkedAtLondon = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "long",
  timeZone: "Europe/London"
}).format(new Date());

const body = [
  "测试通知：David Tennant《White Rabbit Red Rabbit》票务监控已连接 ntfy。",
  `测试时间：${checkedAtLondon}`,
  "这不是有票提醒，只用于确认手机推送配置正常。"
].join("\n");

const response = await fetch(`${server.replace(/\/$/, "")}/${encodeURIComponent(topic)}`, {
  method: "POST",
  headers: {
    Title: "Ticket monitor test",
    Priority: "default",
    Tags: "test_tube,tickets"
  },
  body
});

if (!response.ok) {
  throw new Error(`ntfy test failed with ${response.status}: ${await response.text()}`);
}

console.log("ntfy test notification sent.");
