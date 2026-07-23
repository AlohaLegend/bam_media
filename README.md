# BAM Media Group

Mobile-first landing page for BAM Media Group, a social media and growth partner for QSR and food brands.

Live site: https://bammedia.us/

## Build

This is a static site with no build step.

- `index.html` contains the page structure and copy.
- `styles.css` contains the responsive visual system.
- `script.js` controls the mobile menu and header state.
- `assets/` contains the local hero image.

## CMS Fallback Sync

Jake's backend saves content to the Cloudflare CMS Worker first. The homepage then pulls that JSON at runtime, but Instagram's in-app browser can occasionally show the static GitHub Pages fallback before JavaScript finishes.

To keep that fallback current, `.github/workflows/sync-cms-fallback.yml` runs `scripts/sync-cms-fallback.mjs` every 15 minutes and whenever it receives the `cms_content_saved` repository dispatch event. The script pulls the public CMS JSON, updates `content/site.json`, and rewrites matching fallback text, links, images, posters, and SEO fields in `index.html`.

For near-immediate sync after each backend save, add a GitHub token with repository dispatch access as the Cloudflare Worker secret `GITHUB_SYNC_TOKEN`, then deploy `cms-auth-worker`. The scheduled GitHub Action remains the backup.

## Local Preview

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.
