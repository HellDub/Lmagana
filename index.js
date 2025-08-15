
require("dotenv").config();
const dayjs = require("dayjs");
const cron = require("node-cron");
const { notify } = require("./notify-discord");
const { analyzeScrapedText } = require("./ai");
const { getSources, buildDefaultFFPayload } = require("./sources");
const { runAgentsWorkflow } = require("./agents");

async function runOnce() {
  const ts = dayjs().format("YYYY-MM-DD HH:mm");
  const parts = [];

  // njib l sources
  const sources = getSources({ ffPayload: buildDefaultFFPayload() });
  for (const s of sources) {
    try {
      const lines = await s.run();
      if (Array.isArray(lines) && lines.length) {
        parts.push(`${s.name}:`);
        for (const ln of lines) parts.push(`• ${ln}`);
      }
    } catch (e) {
      parts.push(`(${s.name} error: ${e.message})`);
    }
  }

  const aggregated = [`⚡ XAUUSD Wires — ${ts}`, ...parts].join("\n");

  const model = process.env.OPENROUTER_MODEL;

  const summarizerPromise = (async () => {
    try {
      return await analyzeScrapedText(aggregated);
    } catch (e) {
      return `${aggregated}\n\n(AI error: ${e.message})`;
    }
  })();

  const multiAgentPromise = (async () => {
    try {
      const { combined } = await runAgentsWorkflow({ aggregatedText: aggregated, model });
      return combined;
    } catch (e) {
      return `${aggregated}\n\n(Agents error: ${e.message})`;
    }
  })();

  const [summaryOut, agentsOut] = await Promise.all([summarizerPromise, multiAgentPromise]);
  await Promise.all([notify(summaryOut), notify(agentsOut)]);
}

const once = process.argv.includes("--once");
if (once) {
  runOnce().catch(console.error);
} else {
  runOnce().catch(console.error);
  const cronExpr = process.env.CRON_SCHEDULE || "*/5 * * * *"; // kola 5 d9ay9
  cron.schedule(cronExpr, () => runOnce().catch(console.error), { timezone: process.env.TZ || "Africa/Casablanca" });
}
