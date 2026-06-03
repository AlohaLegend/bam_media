# BAM Website Admin

The admin panel lives at `/admin/` and edits `content/site.json`.

Jake's normal workflow:

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

The even easier long-term option is a GitHub OAuth bridge on Cloudflare Workers. That would make the CMS button simply say `Sign in with GitHub`, but it requires a Cloudflare account plus a GitHub OAuth app secret.

The admin is intentionally narrow. It is for safe copy and stat changes, not layout surgery. Bigger visual changes still belong in the code.

Liam-proofing rule: if the copy starts sounding like it wore a blazer to lunch, shorten it.
