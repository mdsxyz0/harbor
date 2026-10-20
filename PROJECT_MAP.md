# Windows stable installer

## [TECH_STACK]

Stable source: `f103b0d656a672ea3f4941ae47cfecf8e8c7a89b` (Harbor 0.9.22).
Tauri 2, React 19, TypeScript 5.8, pnpm 11.9.0, Node 24, Rust stable.
Windows x64 mpv archives: upstream release 20261020, SHA-256 pinned in workflow.

## [SYSTEM_FLOW]

WIN-SETUP: Dispatch App build with `windows_installer=true` from this branch.
GitHub-hosted Windows downloads and verifies mpv archives, builds an NSIS `.exe`,
and uploads `Harbor-stable-Windows-x64-setup`. No release or updater publication.
Acceptance: successful Windows job and nonempty installer artifact. Linux system
build runs separately on Ubuntu. Windows installation/playback needs native QA.

## [ARCHITECTURE]

`.github/workflows/app-build.yml` owns build setup, bundling, and artifact upload.
Existing application code and installer behavior remain in the stable source.

## [ORPHANS & PENDING]

- Baseline stable run 39196130002: Windows setup fails with HTTP 404 fetching
  `libmpv-2.dll`. Existing App build also uses `--no-bundle` and uploads no installer.
- Beta run 39195825340: missing `tools/pokemon-engine/README.md`; outside this build.
- Hosted Windows/Linux run: https://github.com/mdsxyz0/harbor/actions/runs/39462889461
  at source commit `687cfb4f`; asset setup passed. Linux failed because the
  pre-existing dependency list omits `libudev-dev`, required by `libudev-sys`.
  Added the missing Linux development package; Windows compilation pending.
- `pnpm run check` is unavailable in stable package.json (no check script or Vite+).
- Native Windows installation and playback have not been tested.
- User reports the original repository and hosted services were deleted. This
  workflow fetches mpv directly from its upstream instead. Application endpoints
  in `src/lib/config/endpoints.ts`, public watch-party relay, ASR model download,
  and updater still reference the original services. Restoring those services is
  outside this installer build; a successful build does not verify them.
