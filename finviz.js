
const axios = require("axios");
const cheerio = require("cheerio");

async function fetchFinvizNews(limit = 30) {
  const url = "https://finviz.com/news.ashx";
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 20000,
  });
  const $ = cheerio.load(html);
  const rows = [];
  $("table tr").each((_, tr) => {
    const a = $(tr).find("a");
    const title = a.text().trim();
    const link = a.attr("href");
    const source = $(tr).find("span.source").text().trim() || undefined;
    const time = $(tr).find("td").first().text().trim() || undefined;
    if (title && link && /^https?:\/\//i.test(link)) {
      rows.push({ time, title, link, source, sourceName: "Finviz" });
    }
  });
  if (rows.length === 0) {
    $("a").each((_, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");
      if (title && link && /^https?:\/\//i.test(link)) {
        rows.push({ title, link, sourceName: "Finviz" });
      }
    });
  }
  const seen = new Set();
  const deduped = [];
  for (const it of rows) {
    if (!seen.has(it.title)) { seen.add(it.title); deduped.push(it); }
  }
  return deduped.slice(0, limit);
}

module.exports = { fetchFinvizNews };
