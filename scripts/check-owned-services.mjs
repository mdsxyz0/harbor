import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const config = JSON.parse(readFileSync("src/lib/config/owned-services.json", "utf8"));
const legacy = /(?:^|\.)harbor\.site$/i;
const migrationFiles = new Set([
  "src/lib/config/owned-services.ts",
  "src/lib/config/service-url.ts",
  "src/lib/together/relay-version.ts",
]);
const failures = [];

function inspect(value, path) {
  if (typeof value !== "string") return;
  for (const match of value.matchAll(/(?:https?|wss?):\/\/[^\s"'<>]+/g)) {
    try {
      if (legacy.test(new URL(match[0]).hostname)) failures.push(path);
    } catch {
      // Non-URL prose or a partial template is not a network destination.
    }
  }
}

function inspectJson(value, path) {
  if (typeof value === "string") inspect(value, path);
  else if (Array.isArray(value)) value.forEach((v) => inspectJson(v, path));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => inspectJson(v, path));
}

if (config.schemaVersion !== 1 || config.capabilities.updates !== false || config.capabilities.models !== false) {
  throw new Error("Service capabilities require an explicit verified implementation before enabling updates or model downloads.");
}
for (const origin of Object.values(config.origins)) {
  if (!origin) continue;
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || legacy.test(url.hostname)) {
    throw new Error("Owned service origins must be HTTPS and must not use retired Harbor domains.");
  }
}
const tauri = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
if (tauri.plugins.updater.endpoints.length !== 0) throw new Error("The unsigned fork must not advertise automatic update endpoints.");

const files = execFileSync("git", ["ls-files", "-z", "src", "src-tauri/src", "src-tauri/tauri.conf.json", "public"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const path of files) {
  if (migrationFiles.has(path) || path.startsWith("src/lib/i18n/") || !/\.(?:[cm]?js|tsx?|rs|json)$/.test(path)) continue;
  const source = readFileSync(path, "utf8");
  if (!source.toLowerCase().includes("harbor.site")) continue;
  if (path.endsWith(".json")) {
    inspectJson(JSON.parse(source), path);
  } else if (path.endsWith(".rs")) {
    source.split("\n").filter((line) => !line.trim().startsWith("//")).forEach((line) => inspect(line, path));
  } else {
    const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) inspect(node.text, path);
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
}
if (failures.length) throw new Error(`Retired service URLs remain in: ${[...new Set(failures)].join(", ")}`);
console.log("Owned service configuration and executable destinations passed.");
