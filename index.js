
require("dotenv").config();
const dayjs = require("dayjs");
const cron = require("node-cron");
const { fetchFinvizNews } = require("./finviz");
const { fetchFFCalendar } = require("./forexfactory");
const { labelXAUUSDFromText } = require("./label");
const { notify } = require("./notify-discord");

// Default FF payload for XAUUSD focus (USD only). Adjust dates.
const FF_PAYLOAD = {
  default_view: "this_week",
  impacts: [3,2],
  event_types: [1,2,3,4,5,7,8,9,10,11],
  currencies: [5], // USD only if that's ForexFactory's mapping; confirm when capturing XHR
  begin_date: "August 10, 2025",
  end_date: "August 16, 2025"
};

function actionFromText(text) {
  const doves = (text.match(/\[Dovish\]/g) || []).length;
  const hawks = (text.match(/\[Hawkish\]/g) || []).length;
  if (doves > 0 && hawks === 0) return "Buy";
  if (hawks > 0 && doves === 0) return "Sell";
  return "No Trade";
}

async function runOnce() {
  const ts = dayjs().format("YYYY-MM-DD HH:mm");
  const parts = [`⚡ XAUUSD Wires — ${ts}`];

  // 1) Finviz
  try {
    const finNews = await fetchFinvizNews(25);
    const sel = finNews
      .filter(n => /gold|xau|yield|treasury|cpi|ppi|jobs|payroll|claims|fomc|usd|dxy|powell/i.test(n.title))
      .slice(0, 6);
    if (sel.length) {
      parts.push("Finviz:");
      for (const n of sel) {
        const tone = labelXAUUSDFromText(n.title);
        parts.push(`• [${tone}] ${n.title}`);
      }
    }
  } catch (e) {
    parts.push(`(Finviz error: ${e.message})`);
  }

  // 2) ForexFactory calendar (if configured)
  try {
    if (process.env.FF_URL) {
      const ff = await fetchFFCalendar(FF_PAYLOAD);
      const events = Array.isArray(ff) ? ff : (ff.events || []);
      const soon = events.filter(e => {
        const t = dayjs(e.date || e.time || e.datetime);
        return t.isValid() && t.isAfter(dayjs().subtract(10, "minute")) && t.isBefore(dayjs().add(90, "minute"));
      }).slice(0, 6);
      if (soon.length) {
        parts.push("ForexFactory (next ~90m):");
        for (const e of soon) {
          const title = `${e.country || e.currency || ""} ${e.title || e.event || ""} (${e.impact || ""})`.trim();
          const tone = labelXAUUSDFromText(title + " " + (e.detail || ""));
          parts.push(`• [${tone}] ${title} — ${e.actual ?? "—"} vs ${e.forecast ?? "—"}`);
        }
      }
    } else {
      parts.push("(Set FF_URL in .env to enable ForexFactory calendar checks)");
    }
  } catch (e) {
    parts.push(`(ForexFactory error: ${e.message})`);
  }

  const text = parts.join("\n");
  const action = actionFromText(text);
  const plan =
    action === "Buy"
      ? "BUY XAUUSD on dip; SL ~0.6% below; TP1 +0.6%, TP2 +1.2%"
      : action === "Sell"
      ? "SELL XAUUSD on bounce; SL ~0.6% above; TP1 +0.6%, TP2 +1.2%"
      : "No Trade — signals mixed; wait 1–2m confirmation";

  await notify(`${text}\n\nAction: ${action}\nPlan: ${plan}`);
}

// CLI
const once = process.argv.includes("--once");
if (once) {
  runOnce().catch(console.error);
} else {
  runOnce().catch(console.error);
  cron.schedule("0 7-19 * * 1-5", () => runOnce().catch(console.error), { timezone: process.env.TZ || "Africa/Casablanca" });
}
