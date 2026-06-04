# BAM Website Admin

The admin panel lives at `/admin/`.

Jake's normal workflow:

1. Open `https://bammedia.us/admin/`.
2. Enter the BAM admin password.
3. Edit the safe homepage fields.
4. Click `Save live content`.
5. Refresh the live site.

The admin is intentionally focused. It controls homepage copy, hero stats, ticker labels, the BAM loop, reels, services, public client work, receipts, contact text, email, social links, SEO text, footer copy, and the image/video/logo paths used by those sections.

Layout changes, the hero video, brand-new sections, uploaded asset processing, and design edits still belong in code.

The password is checked by the Cloudflare Worker in `cms-auth-worker/`. The static website does not contain the password.

Liam-proofing rule: if the copy starts sounding like it wore a blazer to lunch, shorten it.
