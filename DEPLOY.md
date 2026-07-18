# Inaya Advisory — Deployment Runbook

Fully static site (HTML/CSS/JS). No build step, no serverless functions, no
environment variables. Booking runs entirely through Cal.com's embed. Canonical
domain: **inayaadvisory.com** (with **inaya-advisory.com** redirecting to it).

## What's in this folder
- `index.html`, `partner.html` — the two live pages. Internal links are
  **relative** (`index.html` / `partner.html`), so navigation works both in
  local preview (opening the files directly) and on Vercel (where `cleanUrls`
  serves them at `/` and `/partner`).
- `styles.css`, `script.js` — styling and behavior
- `fonts/`, `images/`, `favicon.svg` — assets
- `robots.txt`, `sitemap.xml`, `vercel.json` — SEO + hosting config

## Booking
The Partner With Us page embeds Cal.com's calendar for
`abbas-chothia-strmar/introductory-call`. Bookings go **straight to that Cal.com
account** — no API key, no server code. For it to work, that event type must be
**public** and the account's **Google Calendar / Gmail connected** inside Cal.com
(that is where bookings and confirmation emails land). The mandate-inquiry form
also posts to Formspree, so the intake details arrive by email whether or not a
call is booked.

---

## Step 1 — Put the code on GitHub
1. github.com → New repository → name it (e.g. `inaya-site`) → **Private** → Create.
2. On the repo page: **Add file → Upload files**.
3. Drag in everything in this folder (all files, plus `fonts/` and `images/`). Commit.

## Step 2 — Import into Vercel
1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. Framework Preset: **Other**. Leave build/output settings empty. Click **Deploy**.
   (No env vars to set — it just serves the files.)

## Step 3 — Connect the domains
1. Vercel → project → **Settings → Domains**.
2. Add `inayaadvisory.com` (primary) and `www.inayaadvisory.com`.
3. Add `inaya-advisory.com` and `www.inaya-advisory.com`, then set them to
   **Redirect → inayaadvisory.com**.
4. Vercel shows the exact DNS records for each. In **GoDaddy → each domain → DNS**,
   add what Vercel shows. Typical values:
   - Apex (`@`): **A** record → `76.76.21.21`
   - `www`: **CNAME** → `cname.vercel-dns.com`
   Use whatever Vercel displays if it differs. DNS can take 5–60 min.

## Step 4 — Test the booking (do once, then cancel)
1. Open the live site → Partner With Us → fill the form → submit → pick a slot → Confirm.
2. Confirm the booking appears in the `abbas-chothia-strmar` Cal.com account's
   connected calendar and that its confirmation email arrives.
3. Cancel the test booking.

---

## Going forward
- To update the site: re-upload changed files to GitHub; Vercel redeploys automatically.
- All references already use the production domain. Nothing to flip.
