// Vercel serverless function — creates a real Cal.com booking for the selected
// slot. The Cal.com API key stays here on the server. On success, Cal.com sends
// its normal host + attendee confirmation emails and writes the calendar event,
// so the team is notified of every booking natively.
//
// Front-end calls: POST /api/book  with JSON body:
//   { start, name, email, timeZone, firm, companyType, capitalTarget, timeline, description }

const CAL_API = 'https://api.cal.com/v2';
const USERNAME = 'abbas-chothia-strmar';
const EVENT_SLUG = 'introductory-call';

function clip(v) { return String(v == null ? '' : v).slice(0, 500); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const key = process.env.CAL_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'not_configured', message: 'CAL_API_KEY is not set on the server.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const start = body.start;
  const name = body.name;
  const email = body.email;
  const timeZone = body.timeZone || 'UTC';
  if (!start || !name || !email) {
    res.status(400).json({ error: 'missing_fields', message: 'start, name and email are required.' });
    return;
  }

  const payload = {
    start: new Date(start).toISOString(),   // normalise to UTC ISO 8601
    eventTypeSlug: EVENT_SLUG,
    username: USERNAME,
    attendee: { name: String(name), email: String(email), timeZone: timeZone, language: 'en' },
    metadata: {
      firm: clip(body.firm),
      organizationType: clip(body.companyType),
      capitalTarget: clip(body.capitalTarget),
      timeline: clip(body.timeline),
      brief: clip(body.description)
    }
  };

  try {
    const r = await fetch(CAL_API + '/bookings', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'cal-api-version': '2026-02-25',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok || data.status !== 'success') {
      res.status(502).json({ error: 'booking_failed', detail: data });
      return;
    }
    res.status(200).json({ ok: true, uid: (data.data && data.data.uid) || null });
  } catch (e) {
    res.status(502).json({ error: 'booking_error', message: String(e) });
  }
}
