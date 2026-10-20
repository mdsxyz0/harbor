# Harbor Pokémon Engine

This is Harbor's separately built .NET engine for reading and transforming supported Pokémon save data. The desktop application communicates with it as a child process by writing one JSON request to standard input and closing the stream, then reading one JSON response from standard output. The engine returns a proposed candidate save; Harbor owns the user-facing confirmation, backup and file write.

## Reproducible build inputs

`upstream.json` pins PKForge, PKHeX and the plugin source to exact Git commits. `build.mjs` fetches those revisions when requested, verifies each checkout is clean and at the pinned commit, publishes a self-contained .NET 10 executable, archives the corresponding upstream sources, and writes `engine.json` with the executable's SHA-256 digest.

From the repository root, a Windows x64 build is:

```sh
node tools/pokemon-engine/build.mjs --fetch-source <source-directory> --output src-tauri/resources/pokemon-engine --artifacts <artifacts-directory>
```

The caller must provide the .NET SDK version selected by the repository's build workflow. The output directory is packaged as a Tauri resource. The `sources/` directory accompanies the executable for source and license distribution.

## License and scope

This engine and its bundled source set are distributed under GPL-3.0-or-later; see `LICENSE` and the upstream license files. This project is independent of Capstan, Harbor's Java extension compatibility layer. A build with `HARBOR_CAPSTAN_OPTIONAL=1` may explicitly omit Capstan and extension support; building this Pokémon engine does not enable that support.
