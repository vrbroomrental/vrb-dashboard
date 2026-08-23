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

The trade: anonymous access is also what triggers the grey Apps Script banner. You get
the domain and the icon, and you keep the banner.

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
