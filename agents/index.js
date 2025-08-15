const { callOpenRouter } = require("../ai");
const { makeNewsAgentSystem } = require("./newsAgent");
const { makeQuantAgentSystem } = require("./quantAgent");
const { makeDebateSystem } = require("./debateAgent");
const { makeFinalSystem } = require("./finalAgent");

async function runAgentsWorkflow({ aggregatedText, model }) {
  const aggregated = String(aggregatedText || "").slice(0, 6000);

  const newsMessages = [
    { role: "system", content: makeNewsAgentSystem() },
    { role: "user", content: aggregated },
  ];
  const quantMessages = [
    { role: "system", content: makeQuantAgentSystem() },
    { role: "user", content: aggregated },
  ];

  const [newsOut, quantOut] = await Promise.all([
    callOpenRouter(newsMessages, model),
    callOpenRouter(quantMessages, model),
  ]);

  const debateMessages = [
    { role: "system", content: makeDebateSystem() },
    { role: "user", content: `NewsAgent says:\n${newsOut}\n\nQuantAgent says:\n${quantOut}` },
  ];
  const debateOut = await callOpenRouter(debateMessages, model);

  const finalMessages = [
    { role: "system", content: makeFinalSystem() },
    { role: "user", content: [
      "Aggregated Context:",
      aggregated,
      "\nNewsAgent:",
      newsOut,
      "\nQuantAgent:",
      quantOut,
      "\nDebateAgent:",
      debateOut,
    ].join("\n") },
  ];
  const finalOut = await callOpenRouter(finalMessages, model);

  const combined = [
    "🧠 Multi-Agent XAUUSD Decision",
    "",
    "— NewsAgent —",
    newsOut,
    "",
    "— QuantAgent —",
    quantOut,
    "",
    "— Debate —",
    debateOut,
    "",
    "— Final —",
    finalOut,
  ].join("\n");

  return { combined, newsOut, quantOut, debateOut, finalOut };
}

module.exports = { runAgentsWorkflow };


