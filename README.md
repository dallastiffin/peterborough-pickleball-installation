# Peterborough Pickleball Installation - Website

Static site. HTML, CSS and vanilla JavaScript only. No build step, no dependencies.
Deploy the contents of this folder as-is to GitHub Pages, Cloudflare Pages, Netlify
or any static host.

## Business details baked into the site

| Field | Value |
|---|---|
| Domain | `https://peterboroughpickleballinstallation.com` (no www) |
| Phone (display) | `(705) 242-8236` |
| Phone (link) | `tel:+17052428236` |
| Email | `info@peterboroughpickleballinstallation.com` |
| Address | `730 The Kingsway, Peterborough, ON K9J 6W6` |
| Service area | Peterborough, ON and 25 surrounding communities |

To change any of these later, find and replace across the `.html` files. The phone
number and email appear in the top bar, header, hero, every CTA band, the contact
page, the footer, the sticky mobile call bar and the LocalBusiness schema.

## Map

A Google Maps embed for 730 The Kingsway appears in the footer of **every page**
and again on `contact.html`. Both iframes are `loading="lazy"` with a descriptive
`title` and `referrerpolicy="strict-origin-when-cross-origin"`, so they cost
nothing until scrolled into view. The street address is also in the
`LocalBusiness` schema (`streetAddress`, `postalCode`, `hasMap`), which is what
Google reads for local pack results.

To change the pin, replace `MAP_EMBED` in `_build/common.py` and rebuild, or
find-and-replace the `src` on the iframes across the `.html` files.

## Photos

**16 real project photos** are in place, each served as WebP with a JPEG fallback
at two widths (900px and 1536px) via `<picture>` + `srcset`.

| Photo | Used for |
|---|---|
| `backyard-pickleball-court-doubles-game-peterborough` | Home hero, social share image |
| `residential-backyard-pickleball-court-blue-green` | Residential hero |
| `four-pickleball-courts-public-park-aerial` | Commercial hero, home commercial section |
| `pickleball-court-surfacing-crew-at-work` | Resurfacing hero, resurfacing page |
| `backyard-pickleball-court-aerial-overhead` | FAQ hero, gallery |
| `backyard-pickleball-court-beside-swimming-pool` | About hero |
| `backyard-pickleball-court-and-pool-patio-view` | Contact hero, residential page |
| `rural-backyard-pickleball-court-wooded-property` | Gallery hero, home residential section |
| `pickleball-court-granular-base-preparation` | Home base-prep section, gallery |
| `municipal-park-pickleball-court-fencing-benches` | Commercial page, gallery |
| `multi-sport-court-pickleball-basketball` | Gallery (multi-sport) |
| `concrete-pickleball-court-painted-lines` | Gallery (bare concrete option) |
| `estate-property-pickleball-court-aerial` | Gallery |
| `landscaped-backyard-pickleball-court-aerial` | Gallery |
| `backyard-pickleball-court-evening-lighting` | Gallery (lighting) |
| `backyard-pickleball-court-singles-play` | Gallery |

Two source images (`multi-sport-court-pickleball-basketball` and
`concrete-pickleball-court-painted-lines`) are only about 1000-1100px wide, so
they are used at card size only, never as a hero. Nothing is upscaled.

### Still needed - 6 photos

| Slot | Shot |
|---|---|
| Sport court tile hero + gallery (x2) | Modular interlocking tile, outdoor and indoor |
| Maintenance hero + gallery | Court being washed or inspected |
| Tennis court conversion | A tennis court restriped to pickleball |
| Crack repair / faded surface | Close-up of cracks being filled, and a worn court |
| Line striping | Lines being masked and painted |
| Net post installation | Posts being set in ground sleeves |

These slots show styled SVG placeholders labelled **Placeholder** in the gallery.
The court dimensions diagram is a drawn graphic and should stay a graphic, not a
photo.

To swap one in: drop the photo into `/images/` as
`name-900.webp`, `name-900.jpg`, `name-1536.webp`, `name-1536.jpg`, then change
the gallery entry in `_build/p_other.py` from `"name.svg", cat, False` to
`"name", cat, True` and rebuild.

## Folder structure

```
website/
├── index.html                                        Home
├── residential-pickleball-court-installation.html
├── commercial-pickleball-court-installation.html
├── pickleball-court-resurfacing.html
├── sport-court-tile-installation.html
├── pickleball-court-maintenance.html
├── about.html
├── gallery.html
├── faq.html
├── contact.html
├── privacy-policy.html
├── terms.html
├── 404.html
├── css/styles.css
├── js/main.js
├── images/                                           SVG placeholders
├── favicon.svg
├── site.webmanifest
├── _headers                                          Cloudflare cache + security headers
├── _redirects                                        Short URLs (/quote, /residential...)
├── .gitignore
├── DEPLOY.md                                         GitHub + Cloudflare walkthrough
├── google-apps-script.gs                             Lead handler - paste into Apps Script
├── robots.txt
└── sitemap.xml
```

## BEFORE YOU PUBLISH - required changes

1. **Contact form endpoint.** Every form submits through `js/main.js` to a
   Google Apps Script web app that writes leads to a Google Sheet and emails
   you. Deploy `google-apps-script.gs` (setup steps are in its header comment),
   then paste the `/exec` URL into the `ENDPOINT` variable near the top of
   `js/main.js`. Until you do, the JavaScript keeps visitors on the page and
   shows a notice instead of failing silently.

2. **Remaining photos.** Construction, commercial, resurfacing and tile slots
   still use styled placeholders. See the Photos section above.

3. **Testimonials / reviews.** None on the site. Once you have genuine reviews
   with permission, a review section is the single highest-impact addition.

4. **Legal pages.** `privacy-policy.html` and `terms.html` are general
   templates with a visible notice. Have them reviewed against PIPEDA and
   Ontario law, then remove the notice callouts.

5. **Business hours.** Currently Mon-Fri 7-6, Sat 8-4, Sun closed. Update in
   the footer and on `contact.html` if different.

## Deploying

Deployed on **Cloudflare Pages** from GitHub. Full step-by-step instructions,
including the apex-to-www redirect rule and the form endpoint, are in
**`DEPLOY.md`** in this folder.

Short version:

| Cloudflare Pages setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave blank)* |
| Build output directory | `/` |

Push to `main` and Cloudflare redeploys automatically.

**Canonical hostname:** the site uses the **bare domain** (no `www`) in every
canonical URL, Open Graph tag, sitemap entry and schema block. A Cloudflare
Redirect Rule sends `www` traffic to the bare domain, so both hostnames resolve
to one canonical set of URLs.

Do not add a second redirect rule pointing the other way - two opposing rules
create an infinite loop and take the site down.

`404.html` is served automatically for missing pages.

## Local preview

Open `index.html` directly in a browser, or from this folder run:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## SEO notes

- Every page has a unique title, meta description, canonical URL and Open Graph tags.
- `LocalBusiness` JSON-LD on home and contact, including the real phone number.
  `Service` JSON-LD on each service page. `FAQPage` JSON-LD on the home page and
  the FAQ page. `BreadcrumbList` throughout.
- `sitemap.xml` lists all 12 indexable pages. `robots.txt` points to it.
- `404.html` is set to `noindex, follow`.
- After launch: submit the sitemap in Google Search Console and create a Google
  Business Profile using the same name, phone and service area as this site.
  For a local service business the Business Profile usually drives more calls
  than the website alone, and consistent details across both help rankings.

## Colour tokens

All colours live in `:root` at the top of `css/styles.css`:

| Token | Value | Use |
|---|---|---|
| `--white` / `--paper` | `#ffffff` / `#f7f8f7` | Page and alternating section backgrounds |
| `--charcoal` | `#1c2126` | Headings, header bar, footer, form panel |
| `--blue` | `#1668a8` | Pickleball court blue - primary brand colour |
| `--green` | `#2f7d4f` | Court green - secondary accent |
| `--orange` | `#ef7622` | Bright accent, used on dark backgrounds only |
| `--orange-btn` | `#c2560f` | CTA button fill - darker so white text passes WCAG AA |

The button orange is deliberately deeper than the accent orange. `#ef7622` with
white text only reaches 2.9:1 contrast, which fails WCAG AA. `#c2560f` reaches
4.5:1. If you change these, re-check contrast before publishing.

## Accessibility

Skip link, semantic landmarks, single H1 per page, logical heading order,
labelled form fields with inline error messages and `role="alert"`, visible
focus rings, `aria-current` on the active nav item, descriptive alt text on
every image, and `prefers-reduced-motion` support.

## About the `_build/` folder

The sibling `_build/` folder holds the Python generator that produced this site.
You do not need it to run or deploy the website - everything in `website/` is
plain, self-contained HTML/CSS/JS. Keep `_build/` if you want to regenerate the
site after bulk content edits (`python3 build.py`), or delete it. Do not upload
it to your web host.
