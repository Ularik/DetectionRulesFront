import type { SourceHealthStatus } from "../model/types";

export const DEFAULT_HEALTH_WARNING_SECONDS = 300;
export const DEFAULT_HEALTH_OFFLINE_SECONDS = 900;

// Подписи известных типов источников (в макете — WAF, Linux, System); остальные — с заглавной буквы
const SOURCE_TYPE_LABELS: Record<string, string> = {
  waf: "WAF",
  ids: "IDS",
  ips: "IPS",
  edr: "EDR",
  siem: "SIEM",
  vpn: "VPN",
  dns: "DNS",
  linux: "Linux",
  windows: "Windows",
  macos: "macOS",
  system: "System",
  firewall: "Firewall",
  proxy: "Proxy",
};

export function getSourceTypeLabel(sourceType: string | null | undefined) {
  if (!sourceType) return "—";
  const key = sourceType.toLowerCase();
  return SOURCE_TYPE_LABELS[key] ?? sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
}

export const SOURCE_HEALTH_LABELS: Record<SourceHealthStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  offline: "Offline",
};
