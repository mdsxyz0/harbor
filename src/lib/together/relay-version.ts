import { HARBOR_PUBLIC_RELAY_ENABLED, OWNED_SERVICES } from "@/lib/config/endpoints";
import { isLegacyHarborUrl } from "@/lib/config/owned-services";

export const REQUIRED_RELAY_VERSION = 11;
// Empty until Harbor operates an owned public WebSocket relay.
export const HARBOR_PUBLIC_RELAY = HARBOR_PUBLIC_RELAY_ENABLED
  ? OWNED_SERVICES.origins.relayWebSocket
  : "";

export function relayOutdated(version: number | null | undefined): boolean {
  return version == null || version < REQUIRED_RELAY_VERSION;
}

export function isLegacyPublicRelay(url: string): boolean {
  return isLegacyHarborUrl(url) && new URL(url.trim()).hostname.toLowerCase() === "pub.harbor.site";
}

export function isPublicRelay(url: string): boolean {
  if (isLegacyPublicRelay(url)) return true;
  if (!HARBOR_PUBLIC_RELAY) return false;
  try {
    return new URL(url.trim()).origin === new URL(HARBOR_PUBLIC_RELAY).origin;
  } catch {
    return false;
  }
}
