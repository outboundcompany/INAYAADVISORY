// Vercel serverless function — returns real available slots for the Inaya
// introductory call. The Cal.com API key stays here on the server; it is never
// sent to the browser. Front-end calls: GET /api/slots?timeZone=Area/City
//
// Requires a Vercel environment variable:  CAL_API_KEY  (a Cal.com API key,
// starts with "cal_", created on the Cal.com account that owns the event below).

const CAL_API = 'https://api.cal.com/v2';
const USERNAME = 'abbas-chothia-strmar';   // Cal.com username that owns the event
const EVENT_SLUG = 'introductory-call';    // the event type slug
const DAYS_AHEAD = 21;                      // how far out to offer times

module.exports = async function handler(req, res) {
  const key = process.env.CAL_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'not_configured', message: 'CAL_API_KEY is not set on the server.' });
    return;
  }

  const timeZone = (req.query && req.query.timeZone) ? String(req.query.timeZone) : 'UTC';
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString();

  const url = CAL_API + '/slots'
    + '?eventTypeSlug=' + encodeURIComponent(EVENT_SLUG)
    + '&username=' + encodeURIComponent(USERNAME)
    + '&start=' + encodeURIComponent(start)
    + '&end=' + encodeURIComponent(end)
    + '&timeZone=' + encodeURIComponent(timeZone);

  try {
    const r = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + key, 'cal-api-version': '2024-09-04' }
    });
    const data = await r.json();
    if (!r.ok || data.status !== 'success') {
      res.status(502).json({ error: 'slots_failed', detail: data });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    // data.data = { "YYYY-MM-DD": [ { start: "ISO" }, ... ], ... }
    res.status(200).json({ timeZone: timeZone, slots: data.data || {} });
  } catch (e) {
    res.status(502).json({ error: 'slots_error', message: String(e) });
  }
}
