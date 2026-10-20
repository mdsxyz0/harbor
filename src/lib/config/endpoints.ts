import ownedServices from "./owned-services.json";
import { resolveServiceBase } from "./service-url";

export const OWNED_SERVICES = ownedServices;
export const HARBOR_API_DEFAULT_BASE = OWNED_SERVICES.origins.api;
export const HARBOR_PUBLIC_RELAY_ENABLED = OWNED_SERVICES.capabilities.togetherPublicRelay === true;

const env = import.meta.env ?? {};

export const HARBOR_API_BASE = resolveServiceBase(
  env.VITE_HARBOR_API_BASE,
  OWNED_SERVICES.origins.api,
);

const defaultApiOrigin = new URL(HARBOR_API_DEFAULT_BASE).origin;
const configuredApiOrigin = new URL(HARBOR_API_BASE).origin;
const apiUsesCustomOrigin = configuredApiOrigin !== defaultApiOrigin;
export const HARBOR_THEMES_ENABLED = OWNED_SERVICES.capabilities.themes === true;
export const HARBOR_ACCOUNT_ENABLED = HARBOR_THEMES_ENABLED || apiUsesCustomOrigin;
export const HARBOR_SOCIAL_ENABLED = OWNED_SERVICES.capabilities.social === true || apiUsesCustomOrigin;
export const HARBOR_DEFAULT_API_ORIGIN = defaultApiOrigin;

export const HARBOR_TRAKT_BASE = resolveServiceBase(
  env.VITE_HARBOR_TRAKT_BASE,
  HARBOR_API_BASE,
);

export const HARBOR_MAL_BASE = resolveServiceBase(
  env.VITE_HARBOR_MAL_BASE,
  HARBOR_API_BASE,
);

export const HARBOR_TVDB_BASE = resolveServiceBase(
  env.VITE_HARBOR_TVDB_BASE,
  HARBOR_API_BASE,
);

export const HARBOR_BUGS_BASE = resolveServiceBase(
  env.VITE_HARBOR_BUGS_BASE,
  OWNED_SERVICES.origins.bugs,
);

export const HARBOR_SYNC_BASE = resolveServiceBase(
  env.VITE_HARBOR_SYNC_BASE,
  OWNED_SERVICES.origins.sync,
);

export const HARBOR_RELAY_BASE = resolveServiceBase(
  env.VITE_HARBOR_RELAY_BASE,
  OWNED_SERVICES.origins.relayHttp,
);

export const HARBOR_UPDATES_ENABLED = OWNED_SERVICES.capabilities.updates;
export const HARBOR_UPDATES_BASE = resolveServiceBase(
  env.VITE_HARBOR_UPDATES_BASE ?? env.VITE_HARBOR_API_BASE,
  OWNED_SERVICES.origins.api,
);
export const HARBOR_DOWNLOAD_URL = OWNED_SERVICES.links.downloads;

export const HARBOR_DISCORD_INVITE = resolveServiceBase(
  env.VITE_HARBOR_DISCORD_INVITE,
  "https://discord.gg/harbor",
);
