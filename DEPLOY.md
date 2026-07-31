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

1. Add `www.peterboroughpickleballinstallation.com`
2. Add `peterboroughpickleballinstallation.com` (the apex)

Cloudflare creates the DNS records automatically if the domain is already in
your Cloudflare account. If it isn't, move the nameservers to Cloudflare first.

### Apex → www redirect (do this properly)

Every canonical URL, Open Graph tag, sitemap entry and schema reference in this
site uses the `www.` hostname. The bare apex must **301 redirect** to `www.` or
Google treats them as two sites and splits your ranking signals.

Do this with a **Redirect Rule**, not the `_redirects` file — a `/*` splat in
`_redirects` also matches www traffic and causes an infinite loop.

Cloudflare dashboard → your domain → **Rules** → **Redirect Rules** →
**Create rule**:

| Field | Value |
|---|---|
| Rule name | `apex to www` |
| When incoming requests match | Custom filter expression |
| Field | `Hostname` |
| Operator | `equals` |
| Value | `peterboroughpickleballinstallation.com` |
| Then | Dynamic redirect |
| Expression | `concat("https://www.peterboroughpickleballinstallation.com", http.request.uri.path)` |
| Status code | `301` |
| Preserve query string | on |

---

## Step 5 — connect the contact form

**This is the one thing that actually blocks launch.** Every form on the site
posts to `https://formspree.io/f/YOUR_FORM_ID`. Until you replace that, quote
requests go nowhere. The JavaScript currently catches it and shows a notice
rather than sending visitors to a broken URL, but nobody can reach you by form.

Easiest option — **Cloudflare Pages Functions**, no third party:

Create `functions/api/quote.js` in the repo, then change every form's `action`
to `/api/quote`. Cloudflare picks the function up automatically on deploy.

Or use a hosted handler and paste its URL into the `action` attribute of all 13
forms:

- **Formspree** — free tier, 50 submissions/month
- **Web3Forms** — free, no account needed
- **Basin**, **FormSubmit** — similar

Find and replace across the `.html` files:

```
https://formspree.io/f/YOUR_FORM_ID   →   your real endpoint
```

Then **test it yourself** — submit the form and confirm the email arrives at
`info@peterboroughpickleballinstallation.com`. A silently broken form on a
lead-generation site is worse than no site.

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
