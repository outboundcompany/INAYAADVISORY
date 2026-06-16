// Vercel serverless function — creates a booking on Cal.com.
//
// SECURITY: the Cal.com API key lives ONLY in the CAL_API_KEY environment
// variable (set in the Vercel dashboard). It is never written in this file,
// never committed to the repo, and never sent to the browser.
//
// The event type is fixed server-side; the browser supplies the chosen start
// time, the attendee's name / email / time zone, and the mandate details from
// the Partner form (firm, mandate type, capital target, description).

const CAL_USERNAME = 'anas-ansar';
const CAL_EVENT_SLUG = 'gtm-consultation-call';
// Copied on every booking confirmation email so the team receives the lead with
// the structured mandate details (in the notes). Temporary inbox for now.
const NOTIFY_EMAIL = 'hello@outboundcompany.com';

function clip(s, n) {
  s = String(s == null ? '' : s).trim();
  return s.length > n ? s.slice(0, n) : s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  const key = process.env.CAL_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'CAL_API_KEY is not configured on the server.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const start = body.start;
  const name = body.name;
  const email = body.email;
  const timeZone = body.timeZone || 'UTC';
  if (!start || !name || !email) {
    res.status(400).json({ error: 'start, name and email are required.' });
    return;
  }

  // Mandate details from the Partner form — surfaced in the booking so the team
  // sees the full context, not just a name and a time.
  const d = body.details || {};
  const firm = clip(d.firm, 200);
  const mandateType = clip(d.mandateType, 100);
  const capitalTarget = clip(d.capitalTarget, 100);
  const description = clip(d.description, 1000);

  // This event type has two REQUIRED booking fields, so both must always be
  // sent with a non-empty value or Cal rejects the booking:
  //   'title' -> shown as "Company Name and Role"        (we map the firm)
  //   'notes' -> shown as "What would you like to discuss" (mandate details)
  const title = firm || (name + ' — mandate inquiry');
  const notesParts = [];
  if (mandateType) notesParts.push('Mandate Type: ' + mandateType);
  if (capitalTarget) notesParts.push('Capital Target: ' + capitalTarget);
  if (description) notesParts.push(description);
  const notes = notesParts.join('\n') || 'Mandate inquiry';

  // metadata is a structured, always-accepted copy of the same details.
  const metadata = {};
  if (firm) metadata.firm = firm;
  if (mandateType) metadata.mandateType = mandateType;
  if (capitalTarget) metadata.capitalTarget = capitalTarget;
  if (description) metadata.description = clip(description, 500);

  const payload = {
    start: start,
    eventTypeSlug: CAL_EVENT_SLUG,
    username: CAL_USERNAME,
    attendee: { name: name, email: email, timeZone: timeZone, language: 'en' },
    bookingFieldsResponses: { title: title, notes: notes },
    guests: [NOTIFY_EMAIL],
    metadata: metadata
  };

  try {
    const r = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'cal-api-version': '2026-02-25',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach Cal.com.' });
  }
}
