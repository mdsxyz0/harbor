# Harbor beta fork

## [TECH_STACK]

Tauri 2, Rust, React, TypeScript 5.8 and Vite 7; pnpm is locked by the repository. This change targets `beta-branch` (baseline `b43594add58e0fa501b03f4fc2f95f4d40667f0b`, app version 0.9.132). Main, stable and the remaining branches are outside this implementation.

## [SYSTEM_FLOW]

- B1: Startup resolves owned service URLs from `src/lib/config/owned-services.json`. Retired harbor.site destinations are rejected, including saved public relay/sync settings. Custom server settings and stored sessions are preserved. Acceptance: configuration, session and destination checks in hosted Actions.
- B2: Unavailable account, OAuth exchange, public relay, model and update services stop before credential transfer or installation. Settings provide a manual GitHub build link. Existing model files remain usable. Acceptance: regression tests, typecheck and native checks.
- B3: GitHub-hosted Windows and Linux jobs prepare dependencies and build installable artifacts from the beta revision. Capstan is required: the pinned nanojson dependency comes directly from TeamNewPipe on JitPack, retaining checksum verification. Both platforms verify the staged bridge before packaging. Acceptance: successful native bridge ping, NSIS and full Linux package jobs for the changed source.

## [ARCHITECTURE]

- `src/lib/config/`: owned origins, capabilities, URL validation and retired-host classification.
- `src-tauri/src/owned_services.rs`: native access to the same checked-in configuration.
- `src/lib/updater/`: disabled automatic updates until a fork-owned signed feed exists; manual build download remains available.
- `src/lib/account/`, `theme-auth.ts`, `theme-store.ts`, `bundle-store.ts`: default service capability guards without deleting stored credentials.
- `.github/workflows/app-build.yml`: hosted quality checks and parallel Windows/Linux build jobs, artifact upload only.
- `scripts/check-owned-services.mjs`: regression guard against executable retired-domain URLs and accidental unsigned updater activation.

## [ORPHANS & PENDING]

- First hosted run: https://github.com/mdsxyz0/harbor/actions/runs/39472327213, source `dda464d34fa13824fe818c4217c725afb896f2cd`. Ubuntu passed changed-code checks, retired-destination checks, typecheck and Cargo check. Targeted tests: 73 passed, 4 failed in test fixtures/changed manual-download expectations; formatting also failed. Corrections await a fresh hosted run. No local builds or tests were run.
- Run https://github.com/mdsxyz0/harbor/actions/runs/39474211580 verified quality checks and the Windows installer at source `206ab030`; that Windows build omitted Capstan. Linux did not complete successfully. This is baseline evidence, not verification of the Capstan repair.
- Capstan repair: dependency URL now targets the original TeamNewPipe artifact, not a Harbor continuation or application backend. Build jobs require Java 17 and a successful bundled bridge check. Previous dependency-skipping workaround removed. Checks, full builds and runtime verification are pending a fresh hosted run.
- Provenance: JitPack's `e9d656d` build metadata resolves to full upstream commit `e9d656ddb49a412a5a0a5d5ef20ca7ef09549996`. Run https://github.com/mdsxyz0/harbor/actions/runs/39790913957 rejected the old repack checksum on both platforms. The independently hosted JitPack JAR measured SHA-256 `7e3743401a5f4e2330f4d5f95f0f7a7772f518158e67e9cce432b1e2f2e33643`; this digest is now pinned without disabling verification. Runtime compatibility awaits the next build.
- Cloudflare foundation at `harbor-services.xyz7.workers.dev` provides health/config only. Accounts, social features, OAuth exchange, media assets, models, profile sync and relay backends are not implemented. Their capabilities remain disabled; moving a URL does not restore a backend.
- Automatic updates need a fork-owned signing key, feed and matching verified artifacts. No release, signing secret or updater rollout is part of this pass.
- Native installed Windows playback and visual UI acceptance are not verified by compilation. Keep runtime acceptance separate from CI results.
- Stable promotion and feature selection follow beta validation in a later authorized task; no merge into stable or main now.
