
const axios = require("axios");

async function fetchFFCalendar(payload) {
  const FF_URL = process.env.FF_URL;
  if (!FF_URL) throw new Error("Missing FF_URL in env (.env)");
  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
  if (process.env.FF_COOKIES) headers["Cookie"] = process.env.FF_COOKIES;
  if (process.env.FF_CSRF) headers["x-csrf-token"] = process.env.FF_CSRF;

  const { data } = await axios.post(FF_URL, payload, { headers, timeout: 20000 });
  return data;
}

module.exports = { fetchFFCalendar };
