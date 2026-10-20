const SERVICE_NAME = "harbor-services";
const SCHEMA_VERSION = 1;
const SERVICE_NOT_CONFIGURED_RETRY_SECONDS = "300";

const PUBLIC_PATHS = new Set(["/health", "/v1/config"]);
const LEGACY_SERVICE_PREFIXES = [
  "/themes/api",
  "/api",
  "/v1/reports",
  "/v1/feedback",
  "/v1/adreport",
  "/v1/anilist",
  "/updates",
  "/models",
  "/badges",
  "/feed",
  "/rank",
  "/discord",
  "/shaders",
  "/readme-media",
  "/u",
  "/list",
  "/collection",
  "/mal",
];
const LEGACY_SERVICE_PATHS = new Set([
  "/release-notes.json",
  "/download",
  "/announcements.json",
  "/curated-logos.json",
  "/anime-awards.json",
  "/anime-hero-art.json",
]);
const ALLOWED_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function jsonResponse(request, status, value, { publicCors = false, headers = {} } = {}) {
  const responseHeaders = new Headers(SECURITY_HEADERS);
  for (const [name, headerValue] of Object.entries(headers)) {
    responseHeaders.set(name, headerValue);
  }

  if (publicCors) {
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");
  }

  const body = request.method === "HEAD" || status === 204 ? null : JSON.stringify(value);
  return new Response(body, { status, headers: responseHeaders });
}

function isLegacyServicePath(pathname) {
  return (
    LEGACY_SERVICE_PATHS.has(pathname) ||
    LEGACY_SERVICE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function publicConfig() {
  const unavailable = { available: false, reason: "service_not_configured" };
  return {
    schemaVersion: SCHEMA_VERSION,
    service: SERVICE_NAME,
    capabilities: {
      health: { available: true },
      config: { available: true },
      accounts: unavailable,
      themes: unavailable,
      reports: unavailable,
      integrations: unavailable,
      profileSync: unavailable,
      catalogProxies: unavailable,
      updates: unavailable,
      staticAssets: unavailable,
      models: unavailable,
      togetherRelay: unavailable,
    },
  };
}

function healthStatus() {
  return {
    status: "ok",
    service: SERVICE_NAME,
    runtime: "cloudflare-workers",
    schemaVersion: SCHEMA_VERSION,
  };
}

function serviceNotConfigured(request) {
  return jsonResponse(
    request,
    503,
    { error: "service_not_configured", schemaVersion: SCHEMA_VERSION },
    { headers: { "Retry-After": SERVICE_NOT_CONFIGURED_RETRY_SECONDS } },
  );
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (!ALLOWED_METHODS.has(request.method)) {
      return jsonResponse(
        request,
        405,
        { error: "method_not_allowed", allowedMethods: [...ALLOWED_METHODS] },
        { headers: { Allow: "GET, HEAD, OPTIONS" } },
      );
    }

    if (PUBLIC_PATHS.has(pathname)) {
      if (request.method === "OPTIONS") {
        return jsonResponse(request, 204, null, { publicCors: true });
      }
      const body = pathname === "/health" ? healthStatus() : publicConfig();
      return jsonResponse(request, 200, body, { publicCors: true });
    }

    if (isLegacyServicePath(pathname)) {
      return serviceNotConfigured(request);
    }

    return jsonResponse(request, 404, { error: "not_found" });
  },
};
