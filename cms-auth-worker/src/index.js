const DEFAULT_ALLOWED_ORIGINS =
  "https://bammedia.us,https://www.bammedia.us,http://localhost:4173,http://127.0.0.1:4173";
const DEFAULT_CONTENT_URL = "https://bammedia.us/content/site.json";
const CONTENT_KEY = "site.json";
const SESSION_COOKIE = "bam_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const textEncoder = new TextEncoder();

const fallbackContent = {
  seo: {
    title: "BAM Media Group | Food Social That Moves",
    description:
      "BAM Media Group builds social growth systems for quick-service restaurants and food brands that need attention to become orders.",
  },
  hero: {
    eyebrow: "QSR + food brand growth",
    title: "Make food famous. Move orders.",
    copy: "BAM turns social attention into store visits, catering demand, and repeatable local momentum.",
    primaryCta: "Start the conversation",
    secondaryCta: "See the system",
  },
  signals: [
    { value: "10%+", label: "average sales lift" },
    { value: "287%+", label: "average engagement lift" },
    { value: "5B+", label: "food community views" },
  ],
  proof: {
    kicker: "Receipts",
    title: "Attention only matters when it moves the line.",
    metrics: [
      { value: "10%+", label: "average sales lift" },
      { value: "287%+", label: "average engagement lift" },
      { value: "5B+", label: "food community views" },
    ],
  },
  contact: {
    eyebrow: "Ready when the food is",
    title: "Give the next launch, opening, or growth push a system behind it.",
    cta: "Email BAM",
    email: "hello@bammediagroup.us",
  },
  social: {
    instagram: "https://www.instagram.com/bam.social/",
    linkedin: "https://www.linkedin.com/company/bam-media-group/",
  },
};

const base64UrlEncode = (input) => {
  const bytes = typeof input === "string" ? textEncoder.encode(input) : new Uint8Array(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const base64UrlDecode = (input) => {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const jsonResponse = (request, body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request),
      ...(init.headers || {}),
    },
  });

const allowedOrigins = (env) =>
  (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isAllowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin");

  return !origin || allowedOrigins(env).includes(origin);
};

const corsHeaders = (request, env = {}) => {
  const origin = request.headers.get("Origin");
  const allowedOrigin = origin && allowedOrigins(env).includes(origin) ? origin : "https://bammedia.us";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    Vary: "Origin",
  };
};

const readJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const hmacKey = async (secret) =>
  crypto.subtle.importKey("raw", textEncoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

const signPayload = async (payload, secret) => {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), textEncoder.encode(payload));

  return base64UrlEncode(signature);
};

const createSessionValue = async (env) => {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = base64UrlEncode(JSON.stringify({ expiresAt, nonce: crypto.randomUUID() }));
  const signature = await signPayload(payload, env.SESSION_SECRET);

  return `${payload}.${signature}`;
};

const verifySession = async (request, env) => {
  if (!env.SESSION_SECRET) {
    return false;
  }

  const authorization = request.headers.get("Authorization") || "";
  const bearerSession = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  const cookie = request.headers.get("Cookie") || "";
  const [, cookieSession] = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`)) || [];
  const sessionValue = bearerSession || cookieSession;

  if (!sessionValue) {
    return false;
  }

  const [payload, signature] = sessionValue.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = await signPayload(payload, env.SESSION_SECRET);

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const { expiresAt } = JSON.parse(base64UrlDecode(payload));

    return typeof expiresAt === "number" && expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

const sessionCookie = (sessionValue) =>
  `${SESSION_COOKIE}=${sessionValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;

const clearSessionCookie = () =>
  `${SESSION_COOKIE}=deleted; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

const requireSession = async (request, env) => {
  if (await verifySession(request, env)) {
    return null;
  }

  return jsonResponse(request, { error: "Please log in again." }, { status: 401 });
};

const cleanString = (value, fallback = "", maxLength = 220) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  return cleaned.slice(0, maxLength) || fallback;
};

const cleanUrl = (value, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
};

const cleanEmail = (value, fallback = "") => {
  const cleaned = cleanString(value, fallback, 120);

  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned) ? cleaned : fallback;
};

const cleanMetric = (metric = {}, fallback = {}) => ({
  value: cleanString(metric.value, fallback.value, 20),
  label: cleanString(metric.label, fallback.label, 60),
});

const normalizeContent = (content = {}) => ({
  seo: {
    title: cleanString(content.seo?.title, fallbackContent.seo.title, 80),
    description: cleanString(content.seo?.description, fallbackContent.seo.description, 180),
  },
  hero: {
    eyebrow: cleanString(content.hero?.eyebrow, fallbackContent.hero.eyebrow, 48),
    title: cleanString(content.hero?.title, fallbackContent.hero.title, 80),
    copy: cleanString(content.hero?.copy, fallbackContent.hero.copy, 180),
    primaryCta: cleanString(content.hero?.primaryCta, fallbackContent.hero.primaryCta, 40),
    secondaryCta: cleanString(content.hero?.secondaryCta, fallbackContent.hero.secondaryCta, 40),
  },
  signals: [0, 1, 2].map((index) => cleanMetric(content.signals?.[index], fallbackContent.signals[index])),
  proof: {
    kicker: cleanString(content.proof?.kicker, fallbackContent.proof.kicker, 40),
    title: cleanString(content.proof?.title, fallbackContent.proof.title, 110),
    metrics: [0, 1, 2].map((index) => cleanMetric(content.proof?.metrics?.[index], fallbackContent.proof.metrics[index])),
  },
  contact: {
    eyebrow: cleanString(content.contact?.eyebrow, fallbackContent.contact.eyebrow, 48),
    title: cleanString(content.contact?.title, fallbackContent.contact.title, 130),
    cta: cleanString(content.contact?.cta, fallbackContent.contact.cta, 40),
    email: cleanEmail(content.contact?.email, fallbackContent.contact.email),
  },
  social: {
    instagram: cleanUrl(content.social?.instagram, fallbackContent.social.instagram),
    linkedin: cleanUrl(content.social?.linkedin, fallbackContent.social.linkedin),
  },
});

const readFallbackContent = async (env) => {
  try {
    const response = await fetch(env.FALLBACK_CONTENT_URL || DEFAULT_CONTENT_URL, {
      cf: { cacheTtl: 0, cacheEverything: false },
    });

    if (response.ok) {
      return normalizeContent(await response.json());
    }
  } catch {
    return fallbackContent;
  }

  return fallbackContent;
};

const readContent = async (env) => {
  const stored = await env.BAM_CMS_CONTENT?.get(CONTENT_KEY);

  if (stored) {
    try {
      return normalizeContent(JSON.parse(stored));
    } catch {
      return readFallbackContent(env);
    }
  }

  return readFallbackContent(env);
};

const writeContent = async (env, content) => {
  if (!env.BAM_CMS_CONTENT) {
    throw new Error("Content storage is not configured.");
  }

  await env.BAM_CMS_CONTENT.put(CONTENT_KEY, JSON.stringify(content, null, 2), {
    metadata: { updatedAt: new Date().toISOString() },
  });
};

const handleLogin = async (request, env) => {
  const body = await readJson(request);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return jsonResponse(request, { error: "Admin password is not configured." }, { status: 500 });
  }

  if (password !== env.ADMIN_PASSWORD) {
    return jsonResponse(request, { error: "That password did not work." }, { status: 401 });
  }

  const sessionValue = await createSessionValue(env);

  return jsonResponse(
    request,
    { authenticated: true, session: sessionValue },
    {
      headers: {
        "Set-Cookie": sessionCookie(sessionValue),
      },
    },
  );
};

const handleLogout = (request) =>
  jsonResponse(request, { authenticated: false }, { headers: { "Set-Cookie": clearSessionCookie() } });

const handleContentUpdate = async (request, env) => {
  const sessionError = await requireSession(request, env);

  if (sessionError) {
    return sessionError;
  }

  const body = await readJson(request);
  const content = normalizeContent(body?.content || body);

  await writeContent(env, content);

  return jsonResponse(request, { content, updatedAt: new Date().toISOString() });
};

const handleAdminContent = async (request, env) => {
  const sessionError = await requireSession(request, env);

  if (sessionError) {
    return sessionError;
  }

  return jsonResponse(request, { content: await readContent(env) });
};

const handlePublicContent = async (request, env) =>
  jsonResponse(request, await readContent(env), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "false",
    },
  });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (!isAllowedOrigin(request, env)) {
      return jsonResponse(request, { error: "Origin not allowed." }, { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method === "GET" && pathname === "/health") {
      return jsonResponse(request, { ok: true });
    }

    if (request.method === "GET" && pathname === "/content/site.json") {
      return handlePublicContent(request, env);
    }

    if (request.method === "GET" && pathname === "/api/session") {
      return jsonResponse(request, { authenticated: await verifySession(request, env) });
    }

    if (request.method === "POST" && pathname === "/api/login") {
      return handleLogin(request, env);
    }

    if (request.method === "POST" && pathname === "/api/logout") {
      return handleLogout(request);
    }

    if (request.method === "GET" && pathname === "/api/content") {
      return handleAdminContent(request, env);
    }

    if (request.method === "PUT" && pathname === "/api/content") {
      return handleContentUpdate(request, env);
    }

    return jsonResponse(request, { error: "Not found." }, { status: 404 });
  },
};
