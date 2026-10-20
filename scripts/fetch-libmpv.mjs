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

const RELEASE = "20261020";
const ASSET = "mpv-dev-x86_64-20261020-git-6a262d11f6.7z";
const SHA256 = "d16ea67bcc46d4ee9170f05b322d7184768f216f458bef089c3397a6beaff83e";
const url =
  process.env.HARBOR_LIBMPV_URL ??
  `https://github.com/shinchiro/mpv-winbuild-cmake/releases/download/${RELEASE}/${ASSET}`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "src-tauri", "libmpv", "libmpv-2.dll");
const digest = (buf) => createHash("sha256").update(buf).digest("hex");

if (process.platform !== "win32" && !process.env.HARBOR_LIBMPV_FORCE) {
  console.log("[libmpv] not Windows, skipping (mac and linux link system libmpv)");
  process.exit(0);
}

if (process.platform === "win32" && process.arch !== "x64") {
  throw new Error(
    `[libmpv] the pinned Windows DLL is x64; unsupported architecture: ${process.arch}`,
  );
}

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

const temp = mkdtempSync(join(tmpdir(), "harbor-libmpv-"));
try {
  console.log(`[libmpv] fetching ${url}`);
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`[libmpv] download failed (${response.status} ${response.statusText})`);
  }

  const archive = join(temp, ASSET);
  const bytes = Buffer.from(await response.arrayBuffer());
  const got = digest(bytes);
  if (got !== SHA256) {
    throw new Error(`[libmpv] archive checksum mismatch (expected ${SHA256}, got ${got})`);
  }
  writeFileSync(archive, bytes);

  const extracted = join(temp, "extracted");
  mkdirSync(extracted);
  try {
    execFileSync("7z", ["x", "-y", archive, `-o${extracted}`], { stdio: "inherit" });
  } catch {
    throw new Error("[libmpv] extraction failed; install 7-Zip and ensure `7z` is on PATH");
  }

  const dll = findFile(extracted, "libmpv-2.dll");
  if (!dll || statSync(dll).size === 0) {
    throw new Error("[libmpv] libmpv-2.dll was not found in the verified development archive");
  }

  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(dll, dest);
  console.log(`[libmpv] wrote ${dest} (${(statSync(dest).size / 1048576).toFixed(1)} MB)`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
