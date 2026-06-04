const DEFAULT_ALLOWED_DOMAINS = "bammedia.us,www.bammedia.us";
const DEFAULT_SCOPE = "public_repo";
const DEFAULT_ADMIN_URL = "https://bammedia.us/admin/";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const encodeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const safeScriptJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

const normalizeAdminUrl = (value) => {
  const fallback = DEFAULT_ADMIN_URL;

  try {
    const url = new URL(value || fallback);

    if (url.protocol !== "https:") {
      return fallback;
    }

    return url.toString();
  } catch {
    return fallback;
  }
};

const isAllowedDomain = (domain, allowedDomains) =>
  (allowedDomains || DEFAULT_ALLOWED_DOMAINS)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .some((pattern) => {
      const normalized = pattern.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const regex = new RegExp(`^${escapeRegExp(normalized).replace("\\*", ".+")}$`);

      return regex.test(domain || "");
    });

const respondToCms = ({ token, error, errorCode, adminUrl = DEFAULT_ADMIN_URL }) => {
  const state = error ? "error" : "success";
  const payload = error ? { provider: "github", error, errorCode } : { provider: "github", token };
  const normalizedAdminUrl = normalizeAdminUrl(adminUrl);
  const signInUrl = token
    ? `${normalizedAdminUrl.replace(/#.*$/, "")}#/signin/${btoa(JSON.stringify({ token }))}`
    : normalizedAdminUrl;

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BAM Admin Sign In</title>
    <style>
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        margin: 0;
        background: #f6f1e8;
        color: #0c0c0b;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(100% - 40px, 520px);
        display: grid;
        gap: 14px;
        border: 1px solid rgba(12, 12, 11, 0.16);
        border-radius: 8px;
        padding: 24px;
        background: #fffaf0;
      }

      h1 {
        margin: 0;
        font-size: 1.35rem;
        line-height: 1.05;
        text-transform: uppercase;
      }

      p {
        margin: 0;
        color: #6f6860;
        font-weight: 700;
        line-height: 1.45;
      }

      a {
        width: fit-content;
        border-radius: 999px;
        padding: 12px 16px;
        background: #216fbd;
        color: #ffffff;
        font-size: 0.82rem;
        font-weight: 900;
        text-decoration: none;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${error ? "Sign in needs a retry." : "Taking you back to BAM Admin."}</h1>
      <p>
        ${
          error
            ? encodeHtml(error)
            : "GitHub approved the login. If this page opened in the same tab, you will be sent back to the editor automatically."
        }
      </p>
      ${token ? `<a href="${encodeHtml(signInUrl)}">Continue to admin</a>` : ""}
    </main>
    <script>
      (() => {
        const payload = ${safeScriptJson(payload)};
        const state = ${safeScriptJson(state)};
        const provider = "github";
        const signInUrl = ${safeScriptJson(signInUrl)};

        const sendAuthorization = (origin) => {
          window.opener?.postMessage(
            \`authorization:\${provider}:\${state}:\${JSON.stringify(payload)}\`,
            origin
          );
        };

        window.addEventListener("message", ({ data, origin }) => {
          if (data === \`authorizing:\${provider}\`) {
            sendAuthorization(origin);
          }
        });

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(\`authorizing:\${provider}\`, "*");
          return;
        }

        if (state === "success") {
          window.location.replace(signInUrl);
        }
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Set-Cookie": "csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure",
      },
    },
  );
};

const startAuth = async (request, env) => {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider");
  const siteId = requestUrl.searchParams.get("site_id");

  if (provider !== "github") {
    return respondToCms({
      error: "This authenticator only supports GitHub.",
      errorCode: "UNSUPPORTED_BACKEND",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  if (!isAllowedDomain(siteId, env.ALLOWED_DOMAINS)) {
    return respondToCms({
      error: "This domain is not allowed to use the BAM CMS authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return respondToCms({
      error: "GitHub OAuth is not configured yet.",
      errorCode: "MISCONFIGURED_CLIENT",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  const csrfToken = crypto.randomUUID().replaceAll("-", "");
  const authUrl = new URL("https://github.com/login/oauth/authorize");

  authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${requestUrl.origin}/callback`);
  authUrl.searchParams.set("scope", env.GITHUB_SCOPE || DEFAULT_SCOPE);
  authUrl.searchParams.set("state", csrfToken);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      "Set-Cookie": [
        `csrf-token=github_${csrfToken}`,
        "HttpOnly",
        "Path=/",
        "Max-Age=600",
        "SameSite=Lax",
        "Secure",
      ].join("; "),
    },
  });
};

const finishAuth = async (request, env) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const [, csrfToken] = request.headers.get("Cookie")?.match(/\bcsrf-token=github_([0-9a-f]{32})\b/) || [];

  if (!code || !state) {
    return respondToCms({
      error: "GitHub did not return an authorization code.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  if (!csrfToken || csrfToken !== state) {
    return respondToCms({
      error: "Authentication state did not match. Please try signing in again.",
      errorCode: "CSRF_DETECTED",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return respondToCms({
      error: "GitHub OAuth is not configured yet.",
      errorCode: "MISCONFIGURED_CLIENT",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${requestUrl.origin}/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    return respondToCms({
      error: "GitHub token exchange failed. Please try again.",
      errorCode: "TOKEN_REQUEST_FAILED",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error || !tokenData.access_token) {
    return respondToCms({
      error: tokenData.error_description || tokenData.error || "GitHub did not return an access token.",
      errorCode: "TOKEN_REQUEST_FAILED",
      adminUrl: env.CMS_REDIRECT_URL,
    });
  }

  return respondToCms({ token: tokenData.access_token, adminUrl: env.CMS_REDIRECT_URL });
};

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && ["/auth", "/oauth/authorize"].includes(pathname)) {
      return startAuth(request, env);
    }

    if (request.method === "GET" && ["/callback", "/oauth/redirect"].includes(pathname)) {
      return finishAuth(request, env);
    }

    if (request.method === "GET" && pathname === "/health") {
      return new Response("ok", { headers: { "Content-Type": "text/plain;charset=UTF-8" } });
    }

    return new Response("Not found", { status: 404 });
  },
};
