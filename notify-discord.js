
const axios = require("axios");
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

async function notify(text) {
  if (!WEBHOOK) { console.log(text); return; }
  try {
    await axios.post(WEBHOOK, { content: text.slice(0, 1900) });
  } catch (e) {
    console.error("Discord notify error:", e.message);
  }
}
module.exports = { notify };
