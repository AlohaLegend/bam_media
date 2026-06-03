# BAM CMS GitHub Sign In

This Cloudflare Worker turns the CMS login into a normal `Sign in with GitHub` flow.

It exists because `bammedia.us` is a static GitHub Pages site. GitHub Pages cannot safely hold a GitHub OAuth client secret, so the secret lives in Cloudflare instead.

## Deploy Flow

1. Create or open a Cloudflare account.
2. From this folder, deploy the Worker:

   ```powershell
   npm install
   npm run deploy
   ```

3. Copy the Worker URL, usually like:

   ```text
   https://bam-cms-auth.<cloudflare-subdomain>.workers.dev
   ```

4. Create a GitHub OAuth app:

   - Application name: `BAM Website Admin`
   - Homepage URL: `https://bammedia.us/admin/`
   - Authorization callback URL: `<WORKER_URL>/callback`

5. In Cloudflare, open the Worker settings and add these variables:

   - `GITHUB_CLIENT_ID`: the OAuth app client ID
   - `GITHUB_CLIENT_SECRET`: the OAuth app client secret, encrypted/secret
   - `ALLOWED_DOMAINS`: `bammedia.us,www.bammedia.us`
   - `GITHUB_SCOPE`: `public_repo`

6. Run the helper from the repo root:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\enable-cms-oauth.ps1 -WorkerUrl "https://bam-cms-auth.<cloudflare-subdomain>.workers.dev"
   ```

7. Commit and push the config change.

After GitHub Pages updates, Jake can open `https://bammedia.us/admin/` and click `Sign in with GitHub`.

## Rollback

If the Worker is not ready or the OAuth app settings are wrong, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\enable-cms-token-login.ps1
```

Then commit and push. The CMS will go back to the access-token login.
