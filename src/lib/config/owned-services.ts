/** True only for Harbor's former owned domain and its real subdomains. */
export function isLegacyHarborUrl(value: string): boolean {
  try {
    const host = new URL(value.trim()).hostname.toLowerCase();
    return host === "harbor.site" || host.endsWith(".harbor.site");
  } catch {
    return false;
  }
}

export function serviceNotConfiguredError(service: string): Error & {
  status: number;
  code: string;
} {
  return Object.assign(new Error(`Harbor ${service} service is not configured.`), {
    status: 503,
    code: "service_not_configured",
  });
}
