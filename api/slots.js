// Vercel serverless function — returns available booking slots from Cal.com.
//
// SECURITY: the Cal.com API key lives ONLY in the CAL_API_KEY environment
// variable (set in the Vercel dashboard). It is never written in this file,
// never committed to the repo, and never sent to the browser. The browser
// talks to THIS endpoint; this endpoint talks to Cal.com.
//
// The target calendar is fixed server-side so this endpoint can never be used
// as an open proxy to query arbitrary Cal.com accounts with our key.

const CAL_USERNAME = 'anas-ansar';
const CAL_EVENT_SLUG = 'gtm-consultation-call';

export default async function handler(req, res) {
  const key = process.env.CAL_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'CAL_API_KEY is not configured on the server.' });
    return;
  }

  const start = req.query.start;
  const end = req.query.end;
  const timeZone = req.query.timeZone || 'UTC';
  if (!start || !end) {
    res.status(400).json({ error: 'start and end are required (YYYY-MM-DD).' });
    return;
  }

  const params = new URLSearchParams({
    eventTypeSlug: CAL_EVENT_SLUG,
    username: CAL_USERNAME,
    start: String(start),
    end: String(end),
    timeZone: String(timeZone)
  });

  try {
    const r = await fetch('https://api.cal.com/v2/slots?' + params.toString(), {
      headers: {
        Authorization: 'Bearer ' + key,
        'cal-api-version': '2024-09-04'
      }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach Cal.com.' });
  }
}
