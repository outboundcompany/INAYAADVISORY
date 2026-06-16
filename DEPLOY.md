# Inaya Advisory — Deployment Runbook

Static site (HTML/CSS/JS) + two Vercel serverless functions for the custom
booking calendar. Canonical domain: **inayaadvisory.com** (with
**inaya-advisory.com** redirecting to it).

## What's in this folder
- `index.html`, `partner.html` — the two live pages
- `styles.css`, `script.js` — styling and behavior
- `api/slots.js`, `api/book.js` — serverless functions (read Cal.com availability / create bookings)
- `fonts/`, `images/`, `favicon.svg` — assets
- `robots.txt`, `sitemap.xml`, `vercel.json` — SEO + hosting config

## IMPORTANT — the Cal.com key
The Cal.com API key is **never** in the code. It is read from an environment
variable named `CAL_API_KEY`. You paste it into Vercel (Step 3). Do not put it
in any file.

The custom calendar only works once deployed to Vercel with that key set.
On local preview it shows placeholder times by design.

---

## Step 1 — Put the code on GitHub
1. Go to github.com → New repository → name it (e.g. `inaya-site`) → **Private** → Create.
2. On the repo page: **Add file → Upload files**.
3. Drag in everything in this folder, **including the `api/` folder** (and `fonts/`, `images/`). Commit.

## Step 2 — Import into Vercel
1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. Framework Preset: **Other**. Leave build/output settings empty. Click **Deploy**.
   (Vercel auto-detects the `api/` files as serverless functions.)

## Step 3 — Set the Cal.com key
1. Vercel → the project → **Settings → Environment Variables**.
2. Add: Name `CAL_API_KEY`, Value = your Cal.com API key, Environment = **Production** (tick all if asked).
3. Go to **Deployments → … → Redeploy** so the key takes effect.

## Step 4 — Connect the domains
1. Vercel → project → **Settings → Domains**.
2. Add `inayaadvisory.com` (primary) and `www.inayaadvisory.com`.
3. Add `inaya-advisory.com` and `www.inaya-advisory.com`, then set them to
   **Redirect → inayaadvisory.com**.
4. Vercel shows the exact DNS records for each. In **GoDaddy → each domain → DNS**, add what Vercel shows. Typical values:
   - Apex (`@`): **A** record → `76.76.21.21`
   - `www`: **CNAME** → `cname.vercel-dns.com`
   Use whatever Vercel displays if it differs. DNS can take 5–60 min.

## Step 5 — First booking test (do once, then cancel)
1. Open the live site → Partner With Us → fill the form (use a real email) → submit → pick a slot → Confirm.
2. Check the Cal.com calendar: the booking should appear with the firm /
   mandate type / capital target / description in the notes.
3. Check **hello@outboundcompany.com** — it is added as a guest on every booking,
   so it receives Cal's confirmation email with those details in proper structure.
   (To change/remove this later, edit `NOTIFY_EMAIL` in `api/book.js`.)
4. Cancel the test booking.

---

## Going forward
- To update the site: re-upload changed files to GitHub; Vercel redeploys automatically.
- All references already use the production domain. Nothing to flip.
