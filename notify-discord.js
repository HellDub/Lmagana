
const axios = require("axios");
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

async function notify(text) {
  // Always show a preview of what's being sent
  console.log("=== FULL NOTIFICATION PREVIEW ===");
  console.log(text);
  console.log("=================================");
  
  if (!WEBHOOK) { 
    console.log("ℹ️  No Discord webhook configured - showing preview only");
    return; 
  }
  
  try {
    await axios.post(WEBHOOK, { content: text.slice(0, 1900) });
    console.log("✅ Notification sent to Discord successfully");
  } catch (e) {
    console.error("❌ Discord notify error:", e.message);
  }
}
module.exports = { notify };
