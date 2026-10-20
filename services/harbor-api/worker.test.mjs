import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.mjs";

function request(path, method = "GET", headers) {
  return new Request(`https://example.workers.dev${path}`, { method, headers });
}

async function readJson(response) {
  return response.json();
}

test("GET /health reports runtime and schema", async () => {
  const response = await worker.fetch(request("/health"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.deepEqual(await readJson(response), {
    status: "ok",
    service: "harbor-services",
    runtime: "cloudflare-workers",
    schemaVersion: 1,
  });
});

test("HEAD /health has public headers and no body", async () => {
  const response = await worker.fetch(request("/health", "HEAD"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(await response.text(), "");
});

test("GET /v1/config exposes only available and unavailable capabilities", async () => {
  const response = await worker.fetch(request("/v1/config"));
  const config = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(config.schemaVersion, 1);
  assert.equal(config.capabilities.health.available, true);
  assert.equal(config.capabilities.config.available, true);
  for (const [name, capability] of Object.entries(config.capabilities)) {
    if (name === "health" || name === "config") continue;
    assert.deepEqual(capability, {
      available: false,
      reason: "service_not_configured",
    });
  }
});

test("HEAD /v1/config keeps public CORS and omits its body", async () => {
  const response = await worker.fetch(request("/v1/config", "HEAD"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(await response.text(), "");
});

test("OPTIONS exposes CORS only for public endpoints", async () => {
  const publicResponse = await worker.fetch(request("/v1/config", "OPTIONS"));
  const serviceResponse = await worker.fetch(request("/api/imdb", "OPTIONS"));

  assert.equal(publicResponse.status, 204);
  assert.equal(publicResponse.headers.get("access-control-allow-origin"), "*");
  assert.equal(publicResponse.headers.get("access-control-allow-methods"), "GET, HEAD, OPTIONS");
  assert.equal(serviceResponse.status, 503);
  assert.equal(serviceResponse.headers.get("access-control-allow-origin"), null);
});

test("known legacy service routes report not configured for every accepted method", async () => {
  const legacyPaths = [
    "/themes/api/auth/login",
    "/api/imdb/search",
    "/v1/reports",
    "/v1/feedback",
    "/v1/adreport",
    "/v1/anilist/token",
    "/updates/latest.json",
    "/models/ggml-tiny.bin",
    "/badges/minimal/test.webp",
    "/feed/hero-pool.json",
    "/rank/summary",
    "/discord/awards",
    "/shaders/sample/before.webp",
    "/readme-media/hero.png",
    "/u/example",
    "/list/example/list-id",
    "/collection/example/collection-id",
    "/mal/",
    "/release-notes.json",
    "/download",
    "/announcements.json",
    "/curated-logos.json",
    "/anime-awards.json",
    "/anime-hero-art.json",
  ];

  for (const path of legacyPaths) {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const response = await worker.fetch(request(path, method));

      assert.equal(response.status, 503, `${method} ${path}`);
      assert.equal(response.headers.get("retry-after"), "300", `${method} ${path}`);
      assert.equal(
        response.headers.get("access-control-allow-origin"),
        null,
        `${method} ${path}`,
      );
      if (method === "HEAD") {
        assert.equal(await response.text(), "", `${method} ${path}`);
      } else {
        assert.deepEqual(await readJson(response), {
          error: "service_not_configured",
          schemaVersion: 1,
        });
      }
    }
  }
});

test("unknown paths return 404 instead of a placeholder success", async () => {
  for (const path of ["/v1/unknown", "/apiculture", "/badgeshop", "/models-old"]) {
    const response = await worker.fetch(request(path));

    assert.equal(response.status, 404, path);
    assert.deepEqual(await readJson(response), { error: "not_found" });
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  }
});

test("unsupported methods return 405 without consuming the request body", async () => {
  const postRequest = new Request("https://example.workers.dev/health", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "request body is ignored",
  });
  const response = await worker.fetch(postRequest);

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD, OPTIONS");
  assert.deepEqual(await readJson(response), {
    error: "method_not_allowed",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
  });
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(postRequest.bodyUsed, false);
});
