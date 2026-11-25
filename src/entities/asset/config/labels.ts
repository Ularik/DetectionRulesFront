import type { AssetCriticality, AssetEnvironment, AssetType } from "../model/types";

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  server: "Сервер",
  web_server: "Веб-сервер",
  database: "База данных",
  workstation: "Рабочая станция",
  firewall: "Firewall",
  waf: "WAF",
  ips: "IPS",
  router: "Маршрутизатор",
  switch: "Коммутатор",
  domain_controller: "Контроллер домена",
  wazuh_manager: "Wazuh Manager",
  elasticsearch: "Elasticsearch",
  application: "Приложение",
  other: "Другое",
};

export const ASSET_TYPES = Object.keys(ASSET_TYPE_LABELS) as AssetType[];

export const ASSET_CRITICALITY_LABELS: Record<AssetCriticality, string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
};

export const ASSET_CRITICALITIES = Object.keys(ASSET_CRITICALITY_LABELS) as AssetCriticality[];

export const ASSET_ENVIRONMENT_LABELS: Record<AssetEnvironment, string> = {
  prod: "Prod",
  test: "Test",
  dev: "Dev",
  stage: "Stage",
  lab: "Lab",
};

export const ASSET_ENVIRONMENTS = Object.keys(ASSET_ENVIRONMENT_LABELS) as AssetEnvironment[];

export function getAssetTypeLabel(type: string | null | undefined) {
  if (!type) return "—";
  return ASSET_TYPE_LABELS[type as AssetType] ?? type;
}

export function getAssetEnvironmentLabel(environment: string | null | undefined) {
  if (!environment) return "—";
  return ASSET_ENVIRONMENT_LABELS[environment as AssetEnvironment] ?? environment;
}
