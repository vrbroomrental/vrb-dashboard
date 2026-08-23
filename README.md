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

## The deployment has to allow anyone

**This is a prerequisite, not a detail.** Deploy → Manage deployments → pencil →
**Who has access: Anyone**.

On *Anyone with a Google account*, Google intercepts the request before the app is ever
reached and 302s to its sign-in page — and that page sets `X-Frame-Options: DENY`, so it
cannot render inside a frame either. The frame ends up showing Google's own **401**. Not
a wrapper bug: nothing can frame a page that demands an interactive Google login.

**"Anyone" does not mean anyone can see the data.** It means anyone can load the *page*.
Every server function calls `checkPin_()` before it reads or writes anything, so the URL
on its own opens a lock screen and nothing else. That is what the six-digit code is for,
and it is why `doGet()` sets `XFrameOptionsMode.ALLOWALL` — the app was built to be
gated on the data and framed on the page.

Anonymous access is also what triggers the grey Apps Script banner on the direct URL.
Framing turns out to hide it — see below.

## Setting it up

1. Apps Script → **Deploy → Manage deployments** → set access to **Anyone**, copy the
   `/exec` URL.
2. Open `index.html` and put it in `APP_URL` — it is the only line to edit.
3. Push to a GitHub repo and turn on Pages.
4. On the phone: open the domain in Safari → Share → **Add to Home Screen**.

## Publishing

Push this folder to its **own** repo — a repo can carry one custom domain, and the main
site's already has `vrbroomrental.com`. Then Settings → Pages → deploy from the branch.
`CNAME` already carries the domain. There is no build step: it is one HTML file, an
icon and a manifest.

**On a free GitHub account, Pages needs a public repo.** Nothing here is sensitive —
the only thing in it is the `/exec` URL, and the app's gate is on the *data*: every
server entry point checks the code before it reads or writes anything, so the URL on
its own opens a lock screen and nothing else. `robots.txt` and a `noindex` tag keep it
out of search results.

Behind Cloudflare, two settings matter:

- **DNS**: `CNAME  dashboard → <user>.github.io`, proxy **off** (grey cloud) until
  GitHub has issued its certificate, then on if you want it.
- **SSL/TLS mode: Full**. On *Flexible*, Cloudflare talks HTTP to GitHub, GitHub
  redirects to HTTPS, and the two loop until the browser gives up. This is the
  single most common way this setup fails.

## The banner

Google stamps a grey strip across the top of the direct `/exec` page — *"This application
was created by a Google Apps Script user"*, with a report-abuse link. It is the price of
`Anyone` access.

**Through this wrapper it does not appear.** Tested 23 August 2026, same browser and the
same viewport, back to back: the direct URL showed the strip, the framed page showed cream
from the first pixel. That chrome is drawn on the top-level page; framed, it is not drawn.

Take that as observed behaviour, not a guarantee. Google has never documented it and could
change it in any release. If the strip ever turns up inside the frame, nothing breaks — it
is one grey line above a working app.

### The documented fix, if it ever comes to that

The banner is tied to the Apps Script project's Cloud project. A project on the
auto-created default shows it; one associated with a **standard** Cloud project does not:

1. Google Cloud Console → create a project (any name).
2. Copy its **project number** from the dashboard.
3. Apps Script → Project Settings → Google Cloud Platform (GCP) Project →
   **Change project** → paste the number.
4. Configure the OAuth consent screen if it asks.
5. Redeploy: Deploy → Manage deployments → pencil → **New version**.

**On cost:** creating a project is free and nothing here calls a billable service — but
Google leads with a free-trial signup that asks for a card, and it is not certain the
association works without billing enabled. Deliberately skipped, because framing already
solved it.

## The one thing to watch

Safari partitions storage inside a cross-origin frame. The app keeps the six-digit
code and its offline copy in `localStorage`, so under the wrapper they are scoped
to this domain rather than shared with the direct URL — the code may need
entering once more the first time. Every storage call is wrapped, so the worst
case is being asked for the code more often, never a broken screen. If it stops
sticking entirely, use the `/exec` URL directly.
