const DEFAULT_ALLOWED_DOMAINS = "bammedia.us,www.bammedia.us";
const DEFAULT_SCOPE = "public_repo";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const respondToCms = ({ token, error, errorCode }) => {
  const state = error ? "error" : "success";
  const payload = error ? { provider: "github", error, errorCode } : { provider: "github", token };

  return new Response(
    `<!doctype html>
<html>
  <body>
    <script>
      (() => {
        window.addEventListener("message", ({ data, origin }) => {
          if (data === "authorizing:github") {
            window.opener?.postMessage(
              "authorization:github:${state}:${JSON.stringify(payload)}",
              origin
            );
          }
        });
        window.opener?.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
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
    });
  }

  if (!isAllowedDomain(siteId, env.ALLOWED_DOMAINS)) {
    return respondToCms({
      error: "This domain is not allowed to use the BAM CMS authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return respondToCms({
      error: "GitHub OAuth is not configured yet.",
      errorCode: "MISCONFIGURED_CLIENT",
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
    });
  }

  if (!csrfToken || csrfToken !== state) {
    return respondToCms({
      error: "Authentication state did not match. Please try signing in again.",
      errorCode: "CSRF_DETECTED",
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return respondToCms({
      error: "GitHub OAuth is not configured yet.",
      errorCode: "MISCONFIGURED_CLIENT",
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
    });
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error || !tokenData.access_token) {
    return respondToCms({
      error: tokenData.error_description || tokenData.error || "GitHub did not return an access token.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
  }

  return respondToCms({ token: tokenData.access_token });
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
