# dashboard.vrbroomrental.com

A one-page shell that frames the Apps Script web app, so the dashboard lives on
its own domain with its own home-screen icon.

## What it is for

- **The domain.** `dashboard.vrbroomrental.com` instead of a
  `script.google.com/macros/s/AKfycb…/exec` URL nobody can type or remember.
- **The icon.** Added to the home screen from here, so this page owns the icon,
  the name under it and the status-bar colour.
- **The banner.** Google prints "This application was created by a Google Apps
  Script user" above a web app opened directly. Framing it is the usual way
  round that — see *Does it remove the banner?* below.

## Setting it up

1. Apps Script → **Deploy → Manage deployments** → copy the `/exec` URL.
2. Open `index.html` and put it in `APP_URL` — it is the only line to edit.
3. Publish (either route below).
4. On the phone: open the domain in Safari → Share → **Add to Home Screen**.

### GitHub Pages

Push this folder to a repo, then Settings → Pages → deploy from the branch.
`CNAME` already carries the domain; point a `CNAME` DNS record at
`<user>.github.io`.

### Vercel

Import the repo, or `vercel deploy` from this folder. `vercel.json` sets the
headers. Add the domain in the project's Domains tab and follow the DNS it asks
for. Nothing here needs a build step or a serverless function — the credentials
stay in Apps Script, which is the point.

## Does it remove the banner?

Usually, and it is the only approach that does not involve rewriting the app.
Whether it works depends on how Google is serving web apps at the time, and that
has changed before. **Test it in ten seconds:** publish, open the domain, and
look at the top of the screen. If the banner is still there, nothing is lost —
the domain and the icon are worth having on their own.

`doGet()` in `Code.gs` already sets
`setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)`, without which
the frame would refuse to load at all.

## The one thing to watch

Safari partitions storage inside a cross-origin frame. The app keeps the six-digit
code and its offline copy in `localStorage`, so under the wrapper they are scoped
to this domain rather than shared with the direct URL — the code may need
entering once more the first time. Every storage call is wrapped, so the worst
case is being asked for the code more often, never a broken screen. If it stops
sticking entirely, use the `/exec` URL directly.
