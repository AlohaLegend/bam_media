# BAM Website Admin

The admin panel lives at `/admin/`.

Jake's normal workflow:

1. Open `https://bammedia.us/admin/`.
2. Enter the BAM admin password.
3. Edit the safe homepage fields.
4. Click `Save live content`.
5. Refresh the live site.

The admin is intentionally focused. It controls homepage copy, hero stats, ticker labels, the BAM loop, reels, services, public client work, receipts, contact text, email, social links, SEO text, footer copy, and the image/video/logo paths used by those sections.

Asset fields include upload, open, and download controls. Uploading a file stages the new Cloudflare asset URL in that field; Jake still needs to click `Save live content` to publish it.

Changing a reel's Instagram link automatically renders that Instagram reel on the live page. The poster image and preview video fields remain useful as fallbacks and for faster custom visuals when Instagram is slow or unavailable.

Layout changes, the hero video, brand-new sections, and design edits still belong in code.

The password is checked by the Cloudflare Worker in `cms-auth-worker/`. The static website does not contain the password.

Liam-proofing rule: if the copy starts sounding like it wore a blazer to lunch, shorten it.
