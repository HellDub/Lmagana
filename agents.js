const { callOpenRouter } = require("./ai");

function makeNewsAgentSystem() {
  return [
    "You are 'NewsAgent', a macro news analyst specialized in gold (XAUUSD).",
    "Input: Aggregated market headlines and calendar items.",
    "Output:",
    "- Up to 6 short bullets with the strongest market-moving headlines (cite the theme, not links).",
    "- Classify each as Bullish Gold / Bearish Gold / Mixed based on gold vs USD and rates dynamics.",
    "- One-line conclusion and a confidence 0-1.",
    "Format (plain text):",
    "News Bullets:\n- ...\n- ...\nConclusion: ...\nConfidence: <0-1>"
  ].join("\n");
}

function makeQuantAgentSystem() {
  return [
    "You are 'QuantAgent', a fundamentals/quant analyst for XAUUSD.",
    "You do not have real-time prices. Use first-principles macro relationships and robust priors.",
    "Consider: USD strength (DXY), UST yields, real rates, Fed path, inflation impulse, risk-on/off, seasonality.",
    "From the provided context, infer directional bias and probabilities.",
    "Output:",
    "- 3-5 bullets citing the key macro mechanisms at play.",
    "- Direction with probability (e.g., Buy 0.62) and key invalidation.",
    "Format (plain text):",
    "Quant Notes:\n- ...\n- ...\nDirection: <Buy|Sell|No Trade> <probability 0-1>\nInvalidation: ..."
  ].join("\n");
}

function makeDebateSystem() {
  return [
    "You are 'DebateAgent', a moderator. Two analysts (NewsAgent, QuantAgent) provided views.",
    "Task: Identify agreements, conflicts, and which evidence is stronger. Blend into a short synthesis.",
    "Output: 3-5 bullets of synthesis and a single blended stance with rationale.",
    "Format (plain text):",
    "Debate Synthesis:\n- ...\n- ...\nBlended Stance: <Buy|Sell|No Trade> because <one-liner>"
  ].join("\n");
}

function makeFinalSystem() {
  return [
    "You are 'FinalAgent', responsible for the trading decision on XAUUSD.",
    "You receive: (A) Aggregated news context, (B) NewsAgent output, (C) QuantAgent output, (D) DebateAgent synthesis.",
    "Task: Produce a final, concise decision suitable for Discord. Keep <= 1500 chars, plain text.",
    "Structure strictly:",
    "Final Summary:\n- top insights (<=4 bullets)\nAction: <Buy|Sell|No Trade>\nPlan: entry idea + risk mgmt in one line\nConfidence: <0-1>"
  ].join("\n");
}

async function runAgentsWorkflow({ aggregatedText, model }) {
  // Truncate oversized inputs to keep tokens in check
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


