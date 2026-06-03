# BAM Website Admin

The admin panel lives at `/admin/` and edits `content/site.json`.

Jake's normal workflow once OAuth is enabled:

1. Open `https://bammedia.us/admin/`.
2. Click `Sign in with GitHub`.
3. Approve access if GitHub asks.
4. Open `BAM Website` then `Homepage Quick Edits`.
5. Edit copy, stats, contact email, or social links.
6. Publish. GitHub Pages usually updates the live site within a minute or two.

OAuth setup lives in `cms-auth-worker/`. It needs a Cloudflare Worker URL and a GitHub OAuth app secret. After those exist, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\enable-cms-oauth.ps1 -WorkerUrl "https://bam-cms-auth.<cloudflare-subdomain>.workers.dev"
```

Then commit and push.

Current fallback workflow before OAuth is enabled:

1. Open `https://bammedia.us/admin/`.
2. First time only, click `Create admin key`.
3. GitHub opens with the `public_repo` permission already selected. Generate the key and copy it.
4. Back on `/admin/`, click `Paste Admin Key` and paste the key.
5. Jake's browser should remember the login after that.
6. Open `BAM Website` then `Homepage Quick Edits`.
7. Edit copy, stats, contact email, or social links.
8. Publish. GitHub Pages usually updates the live site within a minute or two.

This uses a classic GitHub token with `public_repo` because the repo is public and Jake is a collaborator. It is fewer clicks than fine-grained tokens and avoids the collaborator-repo limitations.

This is not a website password. Editing is protected by GitHub permissions, and the token can be revoked from GitHub at any time.

The admin is intentionally narrow. It is for safe copy and stat changes, not layout surgery. Bigger visual changes still belong in the code.

Liam-proofing rule: if the copy starts sounding like it wore a blazer to lunch, shorten it.
