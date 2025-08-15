const dayjs = require("dayjs");
const { fetchFinvizNews } = require("./finviz");
const { fetchFFCalendar } = require("./forexfactory");
const { labelXAUUSDFromText } = require("./label");

function buildDefaultFFPayload() {
  // Focus USD diyal had semana
  const start = dayjs().startOf("week").add(1, "day"); // Monday
  const end = start.add(6, "day");
  return {
    default_view: "this_week",
    impacts: [3, 2],
    event_types: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
    currencies: [5],
    begin_date: start.format("MMMM D, YYYY"),
    end_date: end.format("MMMM D, YYYY"),
  };
}

function finvizSource(limit = 25) {
  return {
    name: "Finviz",
    async run() {
      const finNews = await fetchFinvizNews(limit);
      const selected = finNews
        .filter(n => /gold|xau|yield|treasury|cpi|ppi|jobs|payroll|claims|fomc|usd|dxy|powell/i.test(n.title))
        .slice(0, 6);
      return selected.map(n => {
        const tone = labelXAUUSDFromText(n.title);
        return `[${tone}] ${n.title}`;
      });
    }
  };
}

function forexFactorySource(ffPayload) {
  return {
    name: "ForexFactory",
    async run() {
      if (!process.env.FF_URL) return ["Set FF_URL in .env to enable ForexFactory calendar checks"]; 
      const ff = await fetchFFCalendar(ffPayload);
      const events = Array.isArray(ff) ? ff : (ff.events || []);
      const soon = events.filter(e => {
        const t = dayjs(e.date || e.time || e.datetime);
        return t.isValid() && t.isAfter(dayjs().subtract(10, "minute")) && t.isBefore(dayjs().add(90, "minute"));
      }).slice(0, 6);
      return soon.map(e => {
        const title = `${e.country || e.currency || ""} ${e.title || e.event || ""} (${e.impact || ""})`.trim();
        const tone = labelXAUUSDFromText(title + " " + (e.detail || ""));
        return `[${tone}] ${title} — ${e.actual ?? "—"} vs ${e.forecast ?? "—"}`;
      });
    }
  };
}

function getSources({ ffPayload } = {}) {
  const list = [
    finvizSource(),
    forexFactorySource(ffPayload || buildDefaultFFPayload()),
  ];
  return list;
}

module.exports = { getSources, buildDefaultFFPayload };


