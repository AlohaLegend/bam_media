# BAM Admin Worker

This Cloudflare Worker powers the custom password-protected editor at:

```text
https://bammedia.us/admin/
```

It stores the editable homepage schema in Cloudflare KV, including copy, stats, reels, services, client cards, links, and asset paths. The public site reads that content from:

```text
https://bam-cms-auth.bammediaauth.workers.dev/content/site.json
```

Uploaded admin assets are also stored in the same KV namespace and served from:

```text
https://bam-cms-auth.bammediaauth.workers.dev/assets/uploads/<filename>
```

Uploads require an authenticated admin session, accept JPG, PNG, WEBP, GIF, MP4, and WEBM, and are capped at 15 MB. Public asset responses support byte ranges so preview videos can scrub/load normally.

The checked-in `content/site.json` remains the fallback if Cloudflare is unavailable.

## Secrets

Set these as encrypted Worker secrets:

- `ADMIN_PASSWORD`: the password Jake uses to open `/admin/`
- `SESSION_SECRET`: a long random string for signing the login cookie

## Variables

These live in `wrangler.toml`:

- `ALLOWED_ORIGINS`: the website origins allowed to use the admin API
- `FALLBACK_CONTENT_URL`: the checked-in JSON fallback
- `BAM_CMS_CONTENT`: the KV namespace binding

## Deploy

From the repo root:

```powershell
.\cms-auth-worker\node_modules\.bin\wrangler.cmd deploy --config .\cms-auth-worker\wrangler.toml
```

Login returns a signed session token to the admin tab and also sets an HttpOnly, Secure, SameSite=Lax cookie.
The session expires after 12 hours.
