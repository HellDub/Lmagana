const axios = require("axios");

function defaultSystemPrompt() {
  return [
    "You are an expert trading assistant focused on XAUUSD (gold vs USD).",
    "You receive aggregated market headlines and calendar items.",
    "Task:",
    "- Read the input; infer tone per item (Hawkish=Dovish for gold).",
    "- Summarize the most relevant signals in <= 6 concise bullets.",
    "- Decide a single trade direction: Buy | Sell | No Trade.",
    "- Propose a compact plan: entries/rationale/risk in one or two lines.",
    "- Keep total output <= 1800 chars. Use plain text (no markdown).",
    "- End with two lines exactly: \"Action: <Buy|Sell|No Trade>\" and \"Plan: <...>\".",
  ].join("\n");
}

async function callOpenRouter(messages, modelOverride) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY in env");

  const model = modelOverride || process.env.OPENROUTER_MODEL || "openai/gpt-4o";

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (process.env.OPENROUTER_REFERER) headers["HTTP-Referer"] = process.env.OPENROUTER_REFERER;
  if (process.env.OPENROUTER_TITLE) headers["X-Title"] = process.env.OPENROUTER_TITLE;

  const body = { model, messages };

  const { data } = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    body,
    { headers, timeout: 30000 }
  );

  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error("OpenRouter: empty response");
  return content;
}

async function analyzeScrapedText(text) {
  const system = process.env.OPENROUTER_SYSTEM_PROMPT || defaultSystemPrompt();
  const messages = [
    { role: "system", content: system },
    { role: "user", content: text },
  ];
  return callOpenRouter(messages);
}

module.exports = { analyzeScrapedText, callOpenRouter, defaultSystemPrompt };


