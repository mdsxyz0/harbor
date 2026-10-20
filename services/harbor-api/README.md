# Harbor services foundation

This standalone Cloudflare Worker is a service foundation only. It has no bindings, secrets, database, custom domain, OAuth implementation, update feed, or static assets. Its public `workers.dev` address can be used for validation before a domain is chosen.

## Routes

- `GET` and `HEAD /health` report runtime liveness and schema version. A successful response confirms that the Worker handler is responding; it is not a readiness check and does not probe downstream services.
- `GET` and `HEAD /v1/config` report public capabilities. Only health and config are available; all service capabilities are explicitly unavailable.
- Known legacy service prefixes (`/themes/api`, `/api`, `/v1/reports`, `/v1/feedback`, `/v1/adreport`, `/v1/anilist`, `/updates`, `/models`, `/badges`, `/feed`, `/rank`, `/discord`, `/shaders`, `/readme-media`, `/u`, `/list`, `/collection`, and `/mal`) return `503 service_not_configured` with `Retry-After`. The known exact legacy routes `/release-notes.json`, `/download`, `/announcements.json`, `/curated-logos.json`, `/anime-awards.json`, and `/anime-hero-art.json` return the same response.
- Unknown paths return `404`. Methods other than `GET`, `HEAD`, and `OPTIONS` return `405` with an `Allow` header.
- CORS is enabled only for the public health and config endpoints. All responses use `Cache-Control: no-store` and API security headers.

No request bodies or headers are logged. The worker does not claim to provide any legacy service behavior; a capability should only be switched on when its implementation, data, secrets, and checks are ready.

## Checks and deployment

The tests use only Node.js built-ins and can be run with:

```sh
node --test services/harbor-api/worker.test.mjs
```

To deploy this worker after reviewing the source and choosing the Cloudflare account/subdomain, run Wrangler from this directory. `workers_dev` is enabled; no custom domain or route is configured here.

## Cloudflare references

- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers security headers](https://developers.cloudflare.com/workers/examples/security-headers/)
