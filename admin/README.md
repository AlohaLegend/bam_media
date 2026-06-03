# BAM Website Admin

The admin panel lives at `/admin/` and edits `content/site.json`.

Jake's normal workflow:

1. Open `https://bammedia.us/admin/`.
2. Click `Sign In Using Access Token`.
3. Create a GitHub token with write access to `AlohaLegend/bam_media`, then copy it.
4. Paste the token into the CMS. Jake's browser will remember it.
5. Open `BAM Website` then `Homepage Quick Edits`.
6. Edit copy, stats, contact email, or social links.
7. Publish. GitHub Pages usually updates the live site within a minute or two.

Recommended token setup: try a fine-grained token first with `Contents` set to `Read and write` for this repo. If GitHub will not let Jake select this collaborator repo, use a classic token with `public_repo` only because the repo is public.

This is not a website password. Editing is protected by GitHub permissions, and the token can be revoked from GitHub at any time.

The admin is intentionally narrow. It is for safe copy and stat changes, not layout surgery. Bigger visual changes still belong in the code.

Liam-proofing rule: if the copy starts sounding like it wore a blazer to lunch, shorten it.
