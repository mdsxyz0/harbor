# Windows stable installer

## [TECH_STACK]

Stable source: `f103b0d656a672ea3f4941ae47cfecf8e8c7a89b` (Harbor 0.9.22).
Tauri 2, React 19, TypeScript 5.8, pnpm 11.9.0, Node 24, Rust stable.
Windows x64 mpv archives: upstream release 20261020, SHA-256 pinned in workflow.

Owned service foundation: dependency-free JavaScript module Worker, compatibility
date 2026-10-20, with Node 24 contract tests on GitHub-hosted Actions. No app
dependency upgrades. Branch audit snapshots 20 remote branch heads before creation
of the service work branch; see `docs/harbor-audit/branches.json` for exact SHAs.

## [SYSTEM_FLOW]

WIN-SETUP: Dispatch App build with `windows_installer=true` from this branch.
GitHub-hosted Windows downloads and verifies mpv archives, builds an NSIS `.exe`,
and uploads `Harbor-stable-Windows-x64-setup`. No release or updater publication.
Acceptance: successful Windows job and nonempty installer artifact. Linux system
build runs separately on Ubuntu. Windows installation/playback needs native QA.

OWN-HEALTH: GET/HEAD `/health` on a newly created Cloudflare Worker reports process
liveness. It does not assert legacy services are operational. Acceptance: hosted
contract tests plus deployed HTTP response. Status: source implemented; checks and
deployment pending.

OWN-CONFIG: `/v1/config` exposes a versioned public capability map; unimplemented
services remain unavailable. Unknown paths return 404, unsupported methods 405,
and recognized unavailable service paths 503. No login, upload, or OAuth handling
is advertised. Status: source implemented; checks and deployment pending.

OWN-BRANCHES: completed source/history inventory and a migration plan for all 20
snapshotted branches. User chose stable first, then selective beta features. No
application endpoint migration, feature merge, or branch deletion is authorized
or implemented as part of the audit. User authorized the standalone Cloudflare
server; selecting a custom domain is deferred.

## [ARCHITECTURE]

`.github/workflows/app-build.yml` owns build setup, bundling, and artifact upload.
Existing application code and installer behavior remain in the stable source.

`services/harbor-api/` contains the independent Worker and contract tests.
`docs/harbor-audit/` contains literal URL references, computed-path candidates,
branch snapshots, service analysis, branch recommendations, and the staged plan.
The existing Together relay remains in `src-tauri/relay/worker.js`; it has not been
published as a public replacement server. No request bodies/credentials are
logged by the new Worker, and no database or secret binding is attached.

## [ORPHANS & PENDING]

- Baseline stable run 39196130002: Windows setup fails with HTTP 404 fetching
  `libmpv-2.dll`. Existing App build also uses `--no-bundle` and uploads no installer.
- Beta run 39195825340: missing `tools/pokemon-engine/README.md`; outside this build.
- Hosted Windows/Linux run: https://github.com/mdsxyz0/harbor/actions/runs/39462889461
  at source commit `687cfb4f`; asset setup passed. Linux failed because the
  pre-existing dependency list omits `libudev-dev`, required by `libudev-sys`.
  Windows build and artifact upload passed on windows-latest. Produced
  `Harbor_0.9.22_x64-setup.exe`; artifact 12284807491 (231524089 bytes compressed).
  Added the missing Linux development package. Follow-up run for `74163e42`:
  https://github.com/mdsxyz0/harbor/actions/runs/39466532057 (pending verification).
- `pnpm run check` was attempted on Windows: `ERR_PNPM_NO_SCRIPT`, because stable
  package.json has no check script or Vite+. The runner reports this command as
  successful despite printing that error; this is not a passing quality check.
- Frontend `tsc -b` and Vite compilation passed as part of the Windows Tauri build.
- Native Windows installation and playback have not been tested.
- User reports the original repository and hosted services were deleted. This
  workflow fetches mpv directly from its upstream instead. Application endpoints
  in `src/lib/config/endpoints.ts`, public watch-party relay, ASR model download,
  and updater still reference the original services. Restoring those services is
  outside this installer build; a successful build does not verify them.
- Owned service deployment and exact-revision hosted tests pending. Do not change
  desktop clients to use this foundation as a replacement for missing backends.
- Planned cross-branch migration remains unimplemented. Original OAuth app
  ownership, deleted service data, assets, and old update signing key are not
  available evidence; do not promise automatic recovery or trusted updates for
  previously installed clients.
