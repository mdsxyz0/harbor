import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "win32") {
  console.log("[mpv] not Windows, skipping bundled mpv.exe");
  process.exit(0);
}

const RELEASE = "20261020";
const SPECS = {
  x64: {
    asset: "mpv-x86_64-20261020-git-6a262d11f6.7z",
    sha256: "cbeda25235a24e9145f6ab3e784052e437e6e5aac306b682afd2bbf0070ddea8",
  },
  arm64: {
    asset: "mpv-aarch64-20261020-git-6a262d11f6.7z",
    sha256: "ad6b33c03cb4b417348d44bd393a10876ff7c619d04349c8a8954dc8db6cec2f",
  },
};

const spec = SPECS[process.arch];
if (!spec) {
  throw new Error(`[mpv] unsupported Windows architecture: ${process.arch}`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetArch = process.arch === "arm64" ? "aarch64" : "x86_64";
const destination = join(root, "src-tauri", "binaries", `mpv-${targetArch}-pc-windows-msvc.exe`);

function findFile(dir, name) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(path, name);
      if (found) return found;
    } else if (entry.name === name) {
      return path;
    }
  }
  return null;
}

const url = `https://github.com/shinchiro/mpv-winbuild-cmake/releases/download/${RELEASE}/${spec.asset}`;
const temp = mkdtempSync(join(tmpdir(), "harbor-mpv-"));

try {
  console.log(`[mpv] fetching ${url}`);
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok)
    throw new Error(`[mpv] download failed (${response.status} ${response.statusText})`);

  const archive = join(temp, spec.asset);
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== spec.sha256)
    throw new Error(`[mpv] checksum mismatch (expected ${spec.sha256}, got ${digest})`);
  writeFileSync(archive, bytes);

  const extracted = join(temp, "extracted");
  mkdirSync(extracted);
  try {
    execFileSync("7z", ["x", "-y", archive, `-o${extracted}`], { stdio: "inherit" });
  } catch {
    throw new Error("[mpv] extraction failed; install 7-Zip and ensure `7z` is on PATH");
  }

  const mpv = findFile(extracted, "mpv.exe");
  if (!mpv) throw new Error("[mpv] mpv.exe was not found in the archive");
  if (statSync(mpv).size === 0) throw new Error("[mpv] mpv.exe in the archive is empty");
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(mpv, destination);
  console.log(`[mpv] wrote ${destination}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
