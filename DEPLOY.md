# Deploying to GitHub + Cloudflare Pages

Everything in this folder is the finished site. No build step, no dependencies.

---

## Step 0 — delete the broken `.git` folder first

I started a Git repo here but could not finish it: this folder is mounted in a
way that allows writing files but not deleting them, and Git needs to delete its
own lock files to work. A partial `.git` folder with a stuck `index.lock` is left
behind. **Delete it before you do anything else.**

In PowerShell, from this folder:

```powershell
Remove-Item -Recurse -Force .git
```

Or just delete the hidden `.git` folder in File Explorer
(View → Show → Hidden items).

Nothing else in this folder is affected. `.gitignore`, `_headers` and
`_redirects` are good and should stay.

---

## Step 1 — create the repo and commit

From this folder in PowerShell:

```powershell
git init -b main
git add .
git commit -m "Launch site for Peterborough Pickleball Installation"
```

If Git asks who you are, set it once:

```powershell
git config --global user.name "Dallas Tiffin"
git config --global user.email "dallastiffin@gmail.com"
```

---

## Step 2 — push to GitHub

**If you have the GitHub CLI** (`gh`), one command does everything:

```powershell
gh repo create peterborough-pickleball-installation --private --source=. --push
```

**If you don't**, create an empty repo at
<https://github.com/new> — no README, no .gitignore, no licence — then:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/peterborough-pickleball-installation.git
git push -u origin main
```

Private is fine. Cloudflare can read private repos once you authorise it.

---

## Step 3 — connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**
2. Authorise GitHub, pick the repo
3. Build settings — **leave the build command empty**:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | *(leave blank)* |
   | Build output directory | `/` |
   | Root directory | *(leave blank)* |

4. **Save and Deploy**

You get a `*.pages.dev` URL in under a minute. Check it before pointing the
domain at it.

---

## Step 4 — custom domain

In your Pages project → **Custom domains** → **Set up a custom domain**:

1. Add `peterboroughpickleballinstallation.com` (the primary)
2. Add `www.peterboroughpickleballinstallation.com` (redirects to the above)

Cloudflare creates the DNS records automatically if the domain is already in
your Cloudflare account. If it isn't, move the nameservers to Cloudflare first.

### Canonical hostname — already handled

The site uses the **bare domain** `peterboroughpickleballinstallation.com` in
every canonical URL, Open Graph tag, sitemap entry and schema block.

A Cloudflare **Redirect Rule** ("Redirect from WWW to root") already sends `www`
traffic to the bare domain, so both hostnames resolve to one canonical set of
URLs. Nothing further to configure.

**Do not add a second redirect rule pointing apex → www.** Two opposing rules
create an infinite redirect loop and take the whole site down. Likewise, keep
the `/*` apex rule out of `_redirects` — a splat there matches www traffic too
and loops.

To check it is working, open an incognito window (browsers cache 301s hard) and
visit `www.peterboroughpickleballinstallation.com/contact`. The address bar
should drop the `www.` and keep the `/contact` path.

## Step 5 — connect the contact form

**This is the one thing that actually blocks launch.** All 13 forms are handled
by `js/main.js`, which POSTs to a Google Apps Script web app. That script logs
every lead to a Google Sheet and emails you an alert. Until you deploy it and
paste the URL in, quote requests go nowhere — the JavaScript shows a notice
instead.

1. Create a Google Sheet, e.g. "Peterborough Pickleball Leads".
2. **Extensions → Apps Script**, delete the starter code, paste in the contents
   of `google-apps-script.gs` from this repo.
3. Set `NOTIFY_EMAIL` at the top to the address that should get lead alerts.
4. Run the `setupSheet` function once and approve the permission prompts.
5. **Deploy → New deployment → Web app**, with:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the `/exec` URL and paste it into `ENDPOINT` near the top of
   `js/main.js`, replacing `YOUR_DEPLOYMENT_ID`.

After any later edit to the script you must **Deploy → Manage deployments →
edit → Version: New version**, or the live URL keeps serving the old code.

Notes: the browser POST uses `mode: "no-cors"`, because Apps Script cannot
return CORS-readable responses. That means the page cannot see server errors —
it shows the success message once the request is sent. The hidden `_gotcha`
field is checked server-side and spam submissions are dropped.

Then **test it yourself** — submit the form, confirm the row lands in the Sheet
and the email arrives. A silently broken form on a lead-generation site is worse
than no site.

---

## Step 6 — after launch

- **Google Search Console** — add the property, submit
  `https://www.peterboroughpickleballinstallation.com/sitemap.xml`
- **Google Business Profile** — create it with exactly the same business name,
  phone `(705) 242-8236` and address `730 The Kingsway` as the site. For a local
  trade business this usually drives more calls than the website itself, and
  matching details across both is what Google uses to trust the listing.
- **Bing Webmaster Tools** — free, takes two minutes, imports from Search Console

---

## Making changes later

Edit the `.html` files directly, then:

```powershell
git add .
git commit -m "what changed"
git push
```

Cloudflare rebuilds and redeploys automatically in under a minute.

For bulk content changes, the Python generator in the sibling `_build/` folder
regenerates every page at once (`python3 build.py`). It is not part of this
repo and does not need to be.

---

## What the extra files do

| File | Purpose |
|---|---|
| `_headers` | Cache and security headers for Cloudflare Pages |
| `_redirects` | Short URLs like `/quote` and `/residential` |
| `.gitignore` | Keeps OS cruft, the unused `CNAME`, and leftover placeholder art out of the repo |
| `robots.txt` | Points crawlers at the sitemap |
| `sitemap.xml` | Lists all 12 indexable pages |
| `404.html` | Cloudflare serves this automatically for missing pages |

`CNAME` is a GitHub Pages file. It is ignored by Git and does nothing on
Cloudflare — you can delete it.
