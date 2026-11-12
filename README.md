# MissReno website

A fast, plain HTML, CSS and JavaScript website for MissReno, Kota Kinabalu.
No build step and no frameworks. Open `index.html` in a browser to preview it.

```
index.html  services.html  styles.html  projects.html
trade.html  showroom.html  404.html  (contact.html is a redirect to showroom.html#contact)
css/styles.css      all styling, colour and type tokens at the top
js/main.js          menu, header, animations, filters, FAQ, WhatsApp form. Settings at the top
fonts/              the two fonts, hosted with the site (no Google Fonts call)
img/                photos (WebP), logos, icons, social share image
video/              put hero.mp4 here (see below)
robots.txt  sitemap.xml  llms.txt  llms-full.txt  site.webmanifest  .nojekyll
scripts/            fetch-logos.sh and fetch-logos.ps1: save the client and partner logos into the site
```

## Publish on GitHub Pages (free)

1. Create a new repository on GitHub and upload everything in this folder.
2. In the repository, open **Settings, Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. After a minute the site is live at `https://<your-username>.github.io/<repository>/`.
5. To use a custom domain, add it under **Settings, Pages, Custom domain**, then point the domain's DNS to GitHub Pages.

When the final domain is known, replace `https://missreno.com` in `robots.txt`, `sitemap.xml`, `llms.txt`,
the canonical and `og:` tags and the JSON-LD data in each page. Do not replace the `/missreno-media/` logo links
until the logos are saved locally (next section).

## Things MissReno must confirm before launch

These are marked in the code with a comment or a bracket and must not go live unchecked.

| Item | Where | Current text |
| --- | --- | --- |
| Projects delivered | Homepage hero stats | 150+ (live site shows both 150+ and 50+) |
| Showroom products | Homepage hero stats | 60+ |
| Quote turnaround | Hero stats, FAQ | 24 hours |
| Reply time | Homepage, contact, closing block | within 2 hours, Mon to Sat |
| Google rating | Hero stats and reviews badge | 4.8 from 91 reviews (checked on Google Maps 12/11/26). It is NOT in the search data (JSON-LD) on purpose: add `aggregateRating` only once it is checked against Google |
| Reviews | Homepage reviews | Copied from the live site. Check each against Google |
| Client and partner logos | Homepage, Styles and Projects pages | Show only companies MissReno has actually supplied, to avoid misrepresentation. Jess to advise which logos stay. Logos are the ones on the current missreno.com. Names were read from the file names or the images: check them. Partner logo 5 (dark badge) and client logo 23 have no name yet |
| Range photos | Styles page | Taken from the company profile and catalogue. Check each photo sits under the right range |
| Sample chips | Homepage, Styles page | Free in Sabah. Large boards: deposit rule not stated |
| FAQ answers | Homepage | "Is it messy?" and "How long does installation take?" use safe wording |
| Feature wall cost FAQ | FAQ in `gen.py` | No price shown for now. Add a starting price later only if MissReno asks |
| Showroom area name | Whole site | "Kian Yap" is now "Kolombong" everywhere, including the address line and map link. Jess to confirm the full postal address wording |
| Email for sales enquiries | Footer, showroom, contact | sales@missreno.com (confirmed)|
| Project galleries | `gallery-*.html` | Photos come from the existing project and range photos. Add more by listing them in `GALLERIES` in `gen.py` |
| Trade terms | Trade page | Business registration shown once |
| Social links | Footer | Based on the handles found on the live site |
| "Open now" chip | Homepage hero, `open` in `js/main.js` | Works out Mon to Sat, 8:30 AM to 5:00 PM in Kota Kinabalu time. It does not know public holidays |

## Hero video

The hero plays `video/hero.mp4` if you add that file. If not, it falls back to the video on the current missreno.com storage.
Please download that video and save it as `video/hero.mp4` so the site does not depend on the old one.
The still photo `img/hero.webp` shows first and stays if no video can play, so nothing breaks.

## Common edits

- **WhatsApp number**: set `whatsapp` in `js/main.js` (form) and the `WA` line in the page files. Search for `60128350133`.
- **Show prices** ("from RM__"): set `showPrices: true` in `js/main.js`, then replace `RM__` in the style cards.
- **Save the logos locally (do this once)**: from the site folder run `sh scripts/fetch-logos.sh` (Mac or Linux) or `powershell -ExecutionPolicy Bypass -File scripts\fetch-logos.ps1` (Windows). It saves every client logo into `img/clients/` and every supplier logo into `img/partners/`, so the site no longer depends on the old one.
- **Client logos**: the logo strip looks for each logo in `img/clients/` first (for example `img/clients/sesb.png`). If the file is not there it loads the same logo from the current missreno.com, and if that fails it shows the name as text. Before the old site is switched off, download the logos from `https://missreno.com/missreno-media/client-logos/` and save them in `img/clients/` with these names: sesb, kis, toyota, proton, suria-sabah, hap-seng, ibis-styles, jesselton-group, sinaland, property-hub, pacific, lido, elemen, dragon-palace, karambunai, kudat, himc-clinic, central-building, cffm, konzepte, mtc, jsk (all `.png`). To add or remove a logo, copy or delete one `<li>` in the strip.
- **Range photos**: each range card on the Styles page has a photo slider. Photos are in `img/ranges/` (for example `flexlam-1.webp`). To add one, save it there and add one more `<img>` and one more `<i></i>` dot in that card.
- **Before and after slider**: the component is ready in `css/styles.css` and `js/main.js`. Add this where wanted, using one matched pair of photos:

  ```html
  <div class="ba">
    <img src="img/project-before.webp" alt="Wall before the upgrade">
    <img class="after" src="img/project-after.webp" alt="Wall after the upgrade">
    <span class="lab l1">Before</span><span class="lab l2">After</span>
    <div class="bar"></div>
    <input type="range" min="0" max="100" value="50" aria-label="Compare before and after">
  </div>
  ```
- **Blog**: left out on purpose. Add it back when there are three or more posts.
- **Photos**: WebP, about 1000 px wide, under 150 KB each. Always write alt text that names the material.

## Design system

Colours, fonts, corner sizes and spacing are the CSS variables at the top of `css/styles.css`.

- **Colours** follow the 2026 product catalogue: deep teal `#061A22`, primary teal `#40B5C4`, gold `#EAC01C`, grey-lilac paper `#E6E8EE`. WhatsApp green is used for WhatsApp actions only.
- **Fonts**: Unbounded for the big headings and numbers (closest free match to the catalogue's Wallman Love, which is a paid font), Plus Jakarta Sans for everything else.
- **Dark chapters** (`.aurora`): hero, start block, reviews, closing block and footer use a slow-moving teal gradient. Add `.frame` to inset one with rounded corners.
- **Glass** (`.glass`): frosted cards used only on top of dark chapters and photos. Add `.spot` for the light that follows the pointer.
- **Header**: teal glass bar with the menu in the centre and one round WhatsApp button. It stays in view, so there is no separate floating chat button.
- **Page banners**: each inner page has a photo on the right that fades into the banner (`.phero-img`). Swap the photo by changing the file name in that page's banner.
- **Interactive blocks**: `data-flow` (how it works, plays by itself and answers to clicks), `data-panels` (who we help, opens on hover or tap), `data-slider` (range photos).
- **Motion** (all in `css/styles.css` under "motion" and in `js/main.js`): `.rv-up` fades a block in on scroll, `.rv-img` unmasks a photo, `data-stagger` delays children one by one, `data-words` lights up a sentence as it scrolls, `data-marquee` scrolls a list of names.

## Accessibility and performance

Skip link, visible focus, 44 px touch targets, text contrast of 4.5:1 or better, motion switched off for people who prefer reduced motion,
a pause button on the hero, lazy-loaded images, self-hosted fonts, and no layout shift from images (sizes are set).
Pages cross-fade in browsers that support view transitions.


### Also confirm with MissReno
- The range tab on each style photo (SoliFlute, MarbleLux, RockNest, Soffit) is a best guess. See `TAB` mapping in the style cards.
- Range facts and sizes on the Styles page come from the catalogue.
- Showroom photos (reception, samples, plant wall, curtains, signboard) were cropped from the catalogue.

## Header
At the top of every page the header is see-through and shows the original colour logo. After a short scroll it
becomes a glossy, blurred teal bar and the logo switches to the white version (`img/logo-color.png` and
`img/logo-white.png`). The effect is in `css/styles.css` under "header"; the scroll trigger is in `js/main.js` (`y > 40`).

## Product ranges (Styles page)
The ranges are a coverflow carousel. Click the centre card to open the range on the same page (address becomes
`styles.html#range-flexlam` and can be shared). Each range's text, photos and sizes live in the page itself, so search
engines can read them. To change a range, edit `RANGE_INFO` in the generator, or edit the `.rpanel` block in `styles.html`.

## SEO and AI search (AIEO)
- Each page has its own title, description, canonical link, social cards and JSON-LD (business, breadcrumbs, FAQ, services, products).
- `sitemap.xml` and `robots.txt` (search and AI crawlers allowed). `llms.txt` and `llms-full.txt` give AI assistants a plain-text summary of the business, hours, services, ranges and FAQs.
- The FAQ answers start with the answer, the Showroom page has an "At a glance" fact list, and the FAQ data matches what is visible on the page.
- Still to do by MissReno: claim and complete the Google Business Profile with the same name, address, phone and hours; add exact map coordinates to the JSON-LD (`geo`) once confirmed; keep `llms.txt` in step with real prices and opening hours.

## Catalogue and map (v6)
- `catalogue.html` lists every design code, finish and size from the 2026 product catalogue (88 swatches in `img/catalogue/`). Each card opens WhatsApp with the code in the message. Prices stay off until MissReno confirms.
- The Showroom page (which now includes Contact) uses a custom teal-tinted map (OpenStreetMap tiles, no API key needed) with a pin at 5.9891851, 116.1281055. Change `LAT`, `LNG` and `MZ` in the generator to adjust it. Attribution is kept in the corner.
- Google review count now reads 91; confirm against the Google profile before launch.
