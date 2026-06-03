# BAM Website Admin

The admin panel lives at `/admin/` and edits `content/site.json`.

This repository is a static GitHub Pages site, so Decap CMS still needs GitHub authentication before Jake can save changes from the browser. After GitHub auth is configured, edits made in the admin panel will commit back to the `main` branch and publish through GitHub Pages.

Recommended setup:

1. Give Jake write access to `AlohaLegend/bam_media`.
2. Configure a Decap CMS GitHub auth provider for `https://bammedia.us/admin/`.
3. Open `https://bammedia.us/admin/`, sign in with GitHub, edit the homepage fields, and publish.
