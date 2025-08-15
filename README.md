# Lmagana — XAUUSD Trading Signals

Scrapes **Finviz** headlines and **ForexFactory** calendar for USD macro, labels each item for **XAUUSD** as **Dovish (Bullish Gold)** / **Hawkish (Bearish Gold)** / **Neutral**, and posts an **Action** (Buy/Sell/No Trade) with SL/TP to **your Discord server** via webhook.

## 1) Install
```bash
cd lmagana
npm install
cp .env.example .env
```

## 2) Discord Webhook
- In Discord: Channel → **Edit Channel** → **Integrations** → **Webhooks** → **New Webhook** → Copy Webhook URL.
- Paste it into `.env` as `DISCORD_WEBHOOK_URL=`.
(Official docs on webhooks) 

## 3) ForexFactory calendar (optional but recommended)
- Open **forexfactory.com/calendar**, set filters (USD, High+Medium, CPI/PPI/NFP etc.).
- DevTools → Network → click **Filter** on site → copy the **XHR** as cURL.
- Put into `.env`: `FF_URL`, and if present `FF_COOKIES`, `FF_CSRF`.
- The script posts your JSON payload and parses the upcoming 90 minutes.

## 4) Run
```bash
npm run once   # test now (sends one alert)
npm start      # hourly, Mon–Fri 07:00–19:00 Africa/Casablanca
```

## 5) Files
- `index.js` — orchestrator & scheduler
- `finviz.js` — Finviz news scraper
- `forexfactory.js` — FF calendar POST replay (you capture the endpoint)
- `label.js` — heuristic labeller for XAUUSD
- `notify-discord.js` — Discord webhook sender
- `.env.example` — config template

## Notes
- Be respectful of each site's Terms.
- If Finviz HTML changes, tweak selectors in `finviz.js`.
- If FF endpoint changes, re-capture via DevTools.
