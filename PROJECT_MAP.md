# Harbor beta fork

## [TECH_STACK]

Tauri 2, Rust, React, TypeScript 5.8 and Vite 7; pnpm is locked by the repository. This change targets `beta-branch` (baseline `b43594add58e0fa501b03f4fc2f95f4d40667f0b`, app version 0.9.132). Main, stable and the remaining branches are outside this implementation.

## [SYSTEM_FLOW]

- B1: Startup resolves owned service URLs from `src/lib/config/owned-services.json`. Retired harbor.site destinations are rejected, including saved public relay/sync settings. Custom server settings and stored sessions are preserved. Acceptance: configuration, session and destination checks in hosted Actions.
- B2: Unavailable account, OAuth exchange, public relay, model and update services stop before credential transfer or installation. Settings provide a manual GitHub build link. Existing model files remain usable. Acceptance: regression tests, typecheck and native checks.
- B3: GitHub-hosted Windows and Linux jobs prepare dependencies and build installable artifacts from the beta revision. The missing Capstan extension is explicitly optional and unavailable in these builds. Acceptance: successful NSIS and full Linux package jobs for the changed source.

## [ARCHITECTURE]

- `src/lib/config/`: owned origins, capabilities, URL validation and retired-host classification.
- `src-tauri/src/owned_services.rs`: native access to the same checked-in configuration.
- `src/lib/updater/`: disabled automatic updates until a fork-owned signed feed exists; manual build download remains available.
- `src/lib/account/`, `theme-auth.ts`, `theme-store.ts`, `bundle-store.ts`: default service capability guards without deleting stored credentials.
- `.github/workflows/app-build.yml`: hosted quality checks and parallel Windows/Linux build jobs, artifact upload only.
- `scripts/check-owned-services.mjs`: regression guard against executable retired-domain URLs and accidental unsigned updater activation.

## [ORPHANS & PENDING]

- Hosted quality and platform build evidence: pending first run of this beta change. No local builds or tests are permitted by the engineering skill.
- Cloudflare foundation at `harbor-services.xyz7.workers.dev` provides health/config only. Accounts, social features, OAuth exchange, media assets, models, profile sync and relay backends are not implemented. Their capabilities remain disabled; moving a URL does not restore a backend.
- Automatic updates need a fork-owned signing key, feed and matching verified artifacts. No release, signing secret or updater rollout is part of this pass.
- Native installed Windows playback and visual UI acceptance are not verified by compilation. Keep runtime acceptance separate from CI results.
- Stable promotion and feature selection follow beta validation in a later authorized task; no merge into stable or main now.
