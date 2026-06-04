const DEFAULT_ALLOWED_ORIGINS =
  "https://bammedia.us,https://www.bammedia.us,http://localhost:4173,http://127.0.0.1:4173";
const DEFAULT_CONTENT_URL = "https://bammedia.us/content/site.json";
const CONTENT_KEY = "site.json";
const SESSION_COOKIE = "bam_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const ASSET_KEY_PREFIX = "asset:";
const ASSET_ROUTE_PREFIX = "/assets/uploads/";
const MAX_ASSET_BYTES = 15 * 1024 * 1024;
const ALLOWED_ASSET_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

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
  ticker: ["QSR", "F&B", "Creator campaigns", "Paid social", "Partnerships", "Bulk-order leads", "Local communities"],
  thesis: {
    kicker: "From scroll to sale",
    title: "A growth engine for brands people can taste.",
    copy:
      "Restaurants do not need more disconnected content. They need a system that spots culture, creates craving, backs winners with media, and converts demand while the food is still hot.",
    focus: ["Creative", "Community", "Conversion"],
  },
  loop: {
    eyebrow: "The BAM loop",
    title: "Every post has a job.",
    copy:
      "Social should create a real-world action: a saved order, a lunch run, a catering inquiry, a launch line, or a creator clip that keeps working after it posts.",
    cards: [
      {
        tag: "Launch clip",
        value: "4,500 videos produced",
        label: "Content engine",
        image: "assets/loop-launch-clip.webp",
        position: "50% 42%",
      },
      {
        tag: "Creator ad",
        value: "-78% lower CPA",
        label: "Paid efficiency",
        image: "assets/loop-creator-ad.webp",
        position: "48% 42%",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Read the room",
        copy: "Track the food moments, creator angles, and community signals worth acting on.",
      },
      {
        number: "02",
        title: "Create the craving",
        copy: "Build short-form content, UGC, and campaign ideas that make the offer feel immediate.",
      },
      {
        number: "03",
        title: "Back the winners",
        copy: "Use paid social and partnerships to turn the best creative into repeatable demand.",
      },
      {
        number: "04",
        title: "Convert the demand",
        copy: "Push attention toward store visits, catering leads, launch traffic, and loyal fans.",
      },
    ],
  },
  reelsSection: {
    kicker: "Instagram content",
    title: "Real reels. Real brands.",
  },
  reels: [
    {
      brand: "German Doner Kebab",
      handle: "@jessknowsthedeal",
      cta: "Watch reel",
      url: "https://www.instagram.com/reel/DTtHCLHkRdr/",
      poster: "assets/reel-gdk.jpg",
      preview: "assets/reel-gdk-preview.mp4",
      ariaLabel: "Watch German Doner Kebab reel on Instagram",
    },
    {
      brand: "University of Beer",
      handle: "@theb0badiaries",
      cta: "Watch reel",
      url: "https://www.instagram.com/reel/DXsXbDuD3TR/",
      poster: "assets/reel-uob.jpg",
      preview: "assets/reel-uob-preview.mp4",
      ariaLabel: "Watch University of Beer reel on Instagram",
    },
    {
      brand: "Northern Cafe",
      handle: "@angela.danii",
      cta: "Watch reel",
      url: "https://www.instagram.com/reel/DWprKbLjasu/",
      poster: "assets/reel-northern-cafe.jpg",
      preview: "assets/reel-northern-cafe-preview.mp4",
      ariaLabel: "Watch Northern Cafe reel on Instagram",
    },
    {
      brand: "Sharky's",
      handle: "@sharkyssocial",
      cta: "Watch reel",
      url: "https://www.instagram.com/reel/DQH57oHElJ5/",
      poster: "assets/reel-sharkys.jpg",
      preview: "assets/reel-sharkys-preview.mp4",
      ariaLabel: "Watch Sharky's reel on Instagram",
    },
    {
      brand: "Dumpling Wei",
      handle: "@comfywithkerry",
      cta: "Watch reel",
      url: "https://www.instagram.com/reel/DWAiKnfROqJ/",
      poster: "assets/reel-dumpling-wei.jpg",
      preview: "assets/reel-dumpling-wei-preview.mp4",
      ariaLabel: "Watch Dumpling Wei reel on Instagram",
    },
  ],
  servicesSection: {
    kicker: "What BAM runs",
    title: "One stack. Built for food.",
  },
  services: [
    { number: "01", title: "Social management", copy: "Strategy, calendars, posting, engagement, and reporting." },
    {
      number: "02",
      title: "Content production",
      copy: "Short-form concepts, shoots, edits, and repeatable food formats.",
    },
    {
      number: "03",
      title: "Paid + UGC",
      copy: "Creator-style ads, testing cycles, and spend behind the clips that move.",
    },
    {
      number: "04",
      title: "Partnerships",
      copy: "Local activations, influencer relationships, and brand collaborations.",
    },
    {
      number: "05",
      title: "Niche communities",
      copy: "Food pages and audience clusters that keep brands close to culture.",
    },
    {
      number: "06",
      title: "Bulk-order leads",
      copy: "Demand generation for catering, office orders, and recurring buyers.",
    },
  ],
  clientsSection: {
    kicker: "Selected client work",
    title: "Brands people recognize.",
    note: "Publicly listed work",
  },
  clients: [
    {
      name: "German Doner Kebab",
      handle: "@germandonerkebabusa",
      category: "Fast casual",
      url: "https://www.gdk.com/us",
      logo: "assets/client-gdk.png",
      ariaLabel: "Visit German Doner Kebab website",
    },
    {
      name: "Sharky's",
      handle: "@sharkyssocial",
      category: "Restaurant group",
      url: "https://www.sharkys.com/",
      logo: "assets/client-sharkys.png",
      ariaLabel: "Visit Sharky's website",
    },
    {
      name: "University of Beer",
      handle: "@UniversityofBeerInsta",
      category: "Restaurant + bar",
      url: "https://www.theuob.com/",
      logo: "assets/client-uob.png",
      ariaLabel: "Visit University of Beer website",
    },
    {
      name: "Northern Cafe",
      handle: "@northerncafe.official",
      category: "Restaurant",
      url: "https://www.northerncafeus.com/",
      logo: "assets/client-northern-cafe.png",
      ariaLabel: "Visit Northern Cafe website",
    },
    {
      name: "Dumpling Wei",
      handle: "@dumpling.wei",
      category: "Restaurant",
      url: "https://www.instagram.com/dumpling.wei/",
      logo: "assets/client-dumpling-wei.jpg",
      ariaLabel: "Visit Dumpling Wei Instagram",
    },
    {
      name: "Shipwrecked Paradise Island",
      handle: "@shipwrecked_paradise_island",
      category: "Hospitality",
      url: "https://www.shipwreckedparadiseisland.com/",
      logo: "assets/client-shipwrecked-paradise-island.jpg",
      ariaLabel: "Visit Shipwrecked Paradise Island website",
    },
    {
      name: "SpudBros Express",
      handle: "@spudbrosexpress",
      category: "Fast casual",
      url: "https://www.spudbrosexpress.com/",
      logo: "assets/client-spudbros-express.jpg",
      ariaLabel: "Visit SpudBros Express website",
    },
    {
      name: "Sharky's Fit",
      handle: "@sharkyssocial",
      category: "Food + fitness",
      url: "https://sharkysfit.com/",
      logo: "assets/client-sharkys-fit.png",
      ariaLabel: "Visit Sharky's Fit website",
    },
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
    panelLabel: "Direct line",
    cta: "Email BAM",
    email: "hello@bammediagroup.us",
  },
  social: {
    instagram: "https://www.instagram.com/bam.social/",
    linkedin: "https://www.linkedin.com/company/bam-media-group/",
  },
  footer: {
    copyright: "Copyright 2018-2026 BAM Media Group Inc. All Rights Reserved.",
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

const publicAssetHeaders = (request, metadata = {}, initHeaders = {}) => {
  const assetMetadata = metadata || {};
  const filename =
    typeof assetMetadata.originalName === "string" ? assetMetadata.originalName.replaceAll('"', "") : "bam-asset";
  const isDownload = new URL(request.url).searchParams.has("download");

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "false",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${filename}"`,
    "Content-Type": assetMetadata.contentType || "application/octet-stream",
    ...initHeaders,
  };
};

const slugify = (value) => {
  const slug = value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54);

  return slug || "bam-asset";
};

const parseRange = (range, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range || "");

  if (!match) {
    return null;
  }

  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;

  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
    return null;
  }

  return { start, end: Math.min(end, size - 1) };
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

const cleanAsset = (value, fallback = "") => {
  const cleaned = cleanString(value, fallback, 220);

  if (/^https:\/\//i.test(cleaned)) {
    return cleanUrl(cleaned, fallback);
  }

  if (/^\/?assets\/[a-z0-9._/-]+\.(?:jpg|jpeg|png|webp|svg|mp4)$/i.test(cleaned)) {
    return cleaned.replace(/^\/+/, "");
  }

  return fallback;
};

const cleanEmail = (value, fallback = "") => {
  const cleaned = cleanString(value, fallback, 120);

  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned) ? cleaned : fallback;
};

const cleanMetric = (metric = {}, fallback = {}) => ({
  value: cleanString(metric.value, fallback.value, 20),
  label: cleanString(metric.label, fallback.label, 60),
});

const cleanTicker = (items, fallbackItems) =>
  fallbackItems.map((fallback, index) => cleanString(items?.[index], fallback, 32));

const cleanLoopCard = (card = {}, fallback = {}) => ({
  tag: cleanString(card.tag, fallback.tag, 32),
  value: cleanString(card.value, fallback.value, 48),
  label: cleanString(card.label, fallback.label, 48),
  image: cleanAsset(card.image, fallback.image),
  position: cleanString(card.position, fallback.position, 24),
});

const cleanCopyCard = (card = {}, fallback = {}) => ({
  number: cleanString(card.number, fallback.number, 8),
  title: cleanString(card.title, fallback.title, 54),
  copy: cleanString(card.copy, fallback.copy, 150),
});

const cleanReel = (reel = {}, fallback = {}) => ({
  brand: cleanString(reel.brand, fallback.brand, 54),
  handle: cleanString(reel.handle, fallback.handle, 54),
  cta: cleanString(reel.cta, fallback.cta, 32),
  url: cleanUrl(reel.url, fallback.url),
  poster: cleanAsset(reel.poster, fallback.poster),
  preview: cleanAsset(reel.preview, fallback.preview),
  ariaLabel: cleanString(reel.ariaLabel, fallback.ariaLabel, 110),
});

const cleanClient = (client = {}, fallback = {}) => ({
  name: cleanString(client.name, fallback.name, 72),
  handle: cleanString(client.handle, fallback.handle, 72),
  category: cleanString(client.category, fallback.category, 42),
  url: cleanUrl(client.url, fallback.url),
  logo: cleanAsset(client.logo, fallback.logo),
  ariaLabel: cleanString(client.ariaLabel, fallback.ariaLabel, 120),
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
  ticker: cleanTicker(content.ticker, fallbackContent.ticker),
  thesis: {
    kicker: cleanString(content.thesis?.kicker, fallbackContent.thesis.kicker, 42),
    title: cleanString(content.thesis?.title, fallbackContent.thesis.title, 94),
    copy: cleanString(content.thesis?.copy, fallbackContent.thesis.copy, 240),
    focus: cleanTicker(content.thesis?.focus, fallbackContent.thesis.focus),
  },
  loop: {
    eyebrow: cleanString(content.loop?.eyebrow, fallbackContent.loop.eyebrow, 42),
    title: cleanString(content.loop?.title, fallbackContent.loop.title, 80),
    copy: cleanString(content.loop?.copy, fallbackContent.loop.copy, 220),
    cards: [0, 1].map((index) => cleanLoopCard(content.loop?.cards?.[index], fallbackContent.loop.cards[index])),
    steps: [0, 1, 2, 3].map((index) => cleanCopyCard(content.loop?.steps?.[index], fallbackContent.loop.steps[index])),
  },
  reelsSection: {
    kicker: cleanString(content.reelsSection?.kicker, fallbackContent.reelsSection.kicker, 42),
    title: cleanString(content.reelsSection?.title, fallbackContent.reelsSection.title, 80),
  },
  reels: fallbackContent.reels.map((fallback, index) => cleanReel(content.reels?.[index], fallback)),
  servicesSection: {
    kicker: cleanString(content.servicesSection?.kicker, fallbackContent.servicesSection.kicker, 42),
    title: cleanString(content.servicesSection?.title, fallbackContent.servicesSection.title, 80),
  },
  services: fallbackContent.services.map((fallback, index) => cleanCopyCard(content.services?.[index], fallback)),
  clientsSection: {
    kicker: cleanString(content.clientsSection?.kicker, fallbackContent.clientsSection.kicker, 42),
    title: cleanString(content.clientsSection?.title, fallbackContent.clientsSection.title, 90),
    note: cleanString(content.clientsSection?.note, fallbackContent.clientsSection.note, 54),
  },
  clients: fallbackContent.clients.map((fallback, index) => cleanClient(content.clients?.[index], fallback)),
  proof: {
    kicker: cleanString(content.proof?.kicker, fallbackContent.proof.kicker, 40),
    title: cleanString(content.proof?.title, fallbackContent.proof.title, 110),
    metrics: [0, 1, 2].map((index) => cleanMetric(content.proof?.metrics?.[index], fallbackContent.proof.metrics[index])),
  },
  contact: {
    eyebrow: cleanString(content.contact?.eyebrow, fallbackContent.contact.eyebrow, 48),
    title: cleanString(content.contact?.title, fallbackContent.contact.title, 130),
    panelLabel: cleanString(content.contact?.panelLabel, fallbackContent.contact.panelLabel, 36),
    cta: cleanString(content.contact?.cta, fallbackContent.contact.cta, 40),
    email: cleanEmail(content.contact?.email, fallbackContent.contact.email),
  },
  social: {
    instagram: cleanUrl(content.social?.instagram, fallbackContent.social.instagram),
    linkedin: cleanUrl(content.social?.linkedin, fallbackContent.social.linkedin),
  },
  footer: {
    copyright: cleanString(content.footer?.copyright, fallbackContent.footer.copyright, 100),
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

const handleAssetUpload = async (request, env) => {
  const sessionError = await requireSession(request, env);

  if (sessionError) {
    return sessionError;
  }

  if (!env.BAM_CMS_CONTENT) {
    return jsonResponse(request, { error: "Asset storage is not configured." }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return jsonResponse(request, { error: "Choose an image or video file first." }, { status: 400 });
  }

  const contentType = typeof file.type === "string" ? file.type.toLowerCase() : "";
  const extension = ALLOWED_ASSET_TYPES[contentType];
  const size = Number(file.size || 0);

  if (!extension) {
    return jsonResponse(request, { error: "Use JPG, PNG, WEBP, GIF, MP4, or WEBM files." }, { status: 400 });
  }

  if (!size || size > MAX_ASSET_BYTES) {
    return jsonResponse(request, { error: "Keep uploads under 15 MB." }, { status: 400 });
  }

  const originalName = typeof file.name === "string" && file.name.trim() ? file.name.trim() : `bam-asset.${extension}`;
  const filename = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}-${slugify(originalName)}.${extension}`;
  const buffer = await file.arrayBuffer();

  await env.BAM_CMS_CONTENT.put(`${ASSET_KEY_PREFIX}${filename}`, buffer, {
    metadata: {
      byteLength: buffer.byteLength,
      contentType,
      originalName,
      uploadedAt: new Date().toISOString(),
    },
  });

  const origin = new URL(request.url).origin;

  return jsonResponse(request, {
    asset: {
      byteLength: buffer.byteLength,
      contentType,
      filename,
      originalName,
      url: `${origin}${ASSET_ROUTE_PREFIX}${filename}`,
    },
  });
};

const handlePublicAsset = async (request, env, filename) => {
  if (!env.BAM_CMS_CONTENT) {
    return new Response("Asset storage is not configured.", { status: 500 });
  }

  if (!/^[a-z0-9][a-z0-9.-]{1,160}\.(?:jpg|png|webp|gif|mp4|webm)$/i.test(filename)) {
    return new Response("Not found.", { status: 404 });
  }

  const { value, metadata } = await env.BAM_CMS_CONTENT.getWithMetadata(`${ASSET_KEY_PREFIX}${filename}`, {
    type: "arrayBuffer",
  });

  if (!value) {
    return new Response("Not found.", { status: 404 });
  }

  const size = value.byteLength;
  const range = parseRange(request.headers.get("Range"), size);

  if (request.headers.get("Range") && !range) {
    return new Response(null, {
      status: 416,
      headers: publicAssetHeaders(request, metadata, { "Content-Range": `bytes */${size}` }),
    });
  }

  if (range) {
    const body = value.slice(range.start, range.end + 1);

    return new Response(body, {
      status: 206,
      headers: publicAssetHeaders(request, metadata, {
        "Content-Length": String(body.byteLength),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      }),
    });
  }

  return new Response(value, {
    headers: publicAssetHeaders(request, metadata, { "Content-Length": String(size) }),
  });
};

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

    if (request.method === "GET" && pathname.startsWith(ASSET_ROUTE_PREFIX)) {
      return handlePublicAsset(request, env, pathname.slice(ASSET_ROUTE_PREFIX.length));
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

    if (request.method === "POST" && pathname === "/api/assets") {
      return handleAssetUpload(request, env);
    }

    return jsonResponse(request, { error: "Not found." }, { status: 404 });
  },
};
