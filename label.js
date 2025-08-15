
function labelXAUUSDFromText(title) {
  const t = String(title || "").toLowerCase();

  const hotInfl = /(cpi|ppi|inflation).*(hot|beat|rises|jumps|accelerate)/i.test(t);
  const softInfl = /(cpi|ppi|inflation).*(cool|miss|drops|falls|slows)/i.test(t);

  const strongJobs = /(nfp|payroll|jobs|claims|unemployment).*(beat|falls|strong|tight|drops)/i.test(t);
  const weakJobs = /(nfp|payroll|jobs|claims|unemployment).*(miss|rises|weak|slows)/i.test(t);

  const hawkFed = /(fomc|fed|powell).*(hawk|higher for longer|hike|no cut|balance sheet)/i.test(t);
  const doveFed = /(fomc|fed|powell).*(dove|cut|ease|pivot)/i.test(t);

  const dxyUp = /(dxy|dollar index|usd).*(rises|jumps|surges|strengthens)/i.test(t);
  const dxyDown = /(dxy|dollar index|usd).*(falls|drops|weakens|slides)/i.test(t);

  const yieldsUp = /(10y|10-year|treasury yield|ust).*(rises|jumps|surges|climbs)/i.test(t);
  const yieldsDown = /(10y|10-year|treasury yield|ust).*(falls|drops|eases|declines)/i.test(t);

  const geoRisk = /(war|attack|geopolit|missile|escalat|sanction|conflict|terror)/i.test(t);

  if (hotInfl || strongJobs || hawkFed || dxyUp || yieldsUp) return "Hawkish";   // bearish gold
  if (softInfl || weakJobs || doveFed || dxyDown || yieldsDown || geoRisk) return "Dovish"; // bullish gold
  return "Neutral";
}

module.exports = { labelXAUUSDFromText };
