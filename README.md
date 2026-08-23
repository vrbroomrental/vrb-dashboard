# dashboard.vrbroomrental.com

A one-page shell that frames the Apps Script web app, so the dashboard lives on
its own domain with its own home-screen icon.

## What it is for

- **The domain.** `dashboard.vrbroomrental.com` instead of a
  `script.google.com/macros/s/AKfycb…/exec` URL nobody can type or remember.
- **The icon.** Added to the home screen from here, so this page owns the icon,
  the name under it and the status-bar colour.
- **The launch.** Opened from the home screen it runs standalone, in the house
  colours, with no browser chrome and no white flash while Google wakes up.

## Setting it up

1. Apps Script → **Deploy → Manage deployments** → copy the `/exec` URL.
2. Open `index.html` and put it in `APP_URL` — it is the only line to edit.
3. Publish (either route below).
4. On the phone: open the domain in Safari → Share → **Add to Home Screen**.

### GitHub Pages

Push this folder to a repo, then Settings → Pages → deploy from the branch.
`CNAME` already carries the domain.

Behind Cloudflare, two settings matter:

- **DNS**: `CNAME  dashboard → <user>.github.io`, proxy **off** (grey cloud) until
  GitHub has issued its certificate, then on if you want it.
- **SSL/TLS mode: Full**. On *Flexible*, Cloudflare talks HTTP to GitHub, GitHub
  redirects to HTTPS, and the two loop until the browser gives up. This is the
  single most common way this setup fails.

### Vercel

Import the repo, or `vercel deploy` from this folder. `vercel.json` sets the
headers. Add the domain in the project's Domains tab and follow the DNS it asks
for. Nothing here needs a build step or a serverless function — the credentials
stay in Apps Script, which is the point.

## It does NOT remove the banner

Framing it was the plan; it does not work, and it cannot.

The page Google serves at `/exec` **is** the banner plus a nested iframe holding your
HTML. Your code runs two frames down and has no access to the one above it. Putting
Google's page inside a third frame brings the banner with it — there is nothing to strip.

**The banner comes from the Apps Script project's Cloud project, not from the page.**
A project on the auto-created default Cloud project shows it; one associated with a
**standard** Cloud project does not:

1. Google Cloud Console → create a project (any name).
2. Copy its **project number** from the dashboard.
3. Apps Script → ⚙ Project Settings → Google Cloud Platform (GCP) Project →
   **Change project** → paste the number.
4. Configure the OAuth consent screen if it asks.
5. Redeploy: Deploy → Manage deployments → pencil → **New version**.

**On cost:** creating a project is free and nothing here calls a billable service — but
Google leads with a free-trial signup that asks for a card, and it is not certain the
association works without billing enabled on the project. Try it without starting the
trial and see whether the banner clears before deciding whether that is worth a card
on file. It is one grey strip; skipping this entirely is a reasonable answer.

This wrapper is worth having either way, for the domain, the icon and the standalone
launch — just not for the banner.

## The one thing to watch

Safari partitions storage inside a cross-origin frame. The app keeps the six-digit
code and its offline copy in `localStorage`, so under the wrapper they are scoped
to this domain rather than shared with the direct URL — the code may need
entering once more the first time. Every storage call is wrapped, so the worst
case is being asked for the code more often, never a broken screen. If it stops
sticking entirely, use the `/exec` URL directly.
