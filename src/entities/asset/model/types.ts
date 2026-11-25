// Актив организации (backend «Активы», /assets). Схема ответа GET в OpenAPI не описана —
// поля сняты с ответа GET /assets/; тело POST/PUT — AssetCreateUpdateSchema

export type AssetType =
  | "server"
  | "web_server"
  | "database"
  | "workstation"
  | "firewall"
  | "waf"
  | "ips"
  | "router"
  | "switch"
  | "domain_controller"
  | "wazuh_manager"
  | "elasticsearch"
  | "application"
  | "other";

export type AssetCriticality = "low" | "medium" | "high" | "critical";

export type AssetEnvironment = "prod" | "test" | "dev" | "stage" | "lab";

export interface Asset {
  asset_id: string;
  organization_id: string | null;
  name: string;
  ip: string;
  hostnames: string[];
  asset_type: AssetType | null;
  criticality: AssetCriticality;
  environment: AssetEnvironment | null;
  tags: string[];
  enabled: boolean;
  description: string | null;
}

export interface AssetListApiResponse {
  items: Asset[];
  count: number;
}

// AssetCreateUpdateSchema
export interface AssetCreateUpdateType {
  organization_id: string;
  name: string;
  ip: string;
  hostnames: string[];
  asset_type: AssetType | null;
  criticality: AssetCriticality;
  environment: AssetEnvironment | null;
  tags: string[];
  enabled: boolean;
  description: string | null;
}
