import { isLegacyHarborUrl } from "./owned-services";

export function resolveServiceBase(raw: string | undefined, fallback: string): string {
  const value = typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      isLegacyHarborUrl(value)
    ) {
      return fallback.replace(/\/+$/, "");
    }
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return fallback.replace(/\/+$/, "");
  }
}

export function isLegacyPublicRelay(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.toLowerCase() === "pub.harbor.site";
  } catch {
    return false;
  }
}
