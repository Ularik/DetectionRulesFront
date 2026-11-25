// Источник событий (backend «Источники», /sources). Схемы ответа в OpenAPI не описаны —
// поля сняты с ответов GET /sources/, /sources/{id}, /health и /sample-events

export interface SourceType {
  source_id: string;
  organization_id: string | null;
  name: string;
  source_type: string;
  vendor_name: string | null;
  product_name: string | null;
  normalization_profile: string | null;
  agent_ids: string[];
  agent_names: string[];
  hostnames: string[];
  locations: string[];
  device_ips: string[];
  /** У старых записей порогов может не быть — тогда backend считает по умолчанию 300 / 900 */
  health_warning_after_seconds?: number;
  health_offline_after_seconds?: number;
  enabled: boolean;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SourceListApiResponse {
  items: SourceType[];
}

// SourceCreateUpdateSchema
export interface SourceCreateUpdateType {
  organization_id: string | null;
  name: string;
  source_type: string;
  vendor_name: string | null;
  product_name: string | null;
  normalization_profile: string | null;
  agent_ids: string[];
  agent_names: string[];
  hostnames: string[];
  locations: string[];
  device_ips: string[];
  health_warning_after_seconds: number;
  health_offline_after_seconds: number;
  enabled: boolean;
  description: string | null;
}

export type SourceHealthStatus = "healthy" | "warning" | "offline";

export interface SourceHealthType {
  source_id: string;
  source_name: string;
  last_event_at: string | null;
  events_5m: number;
  eps_5m: number;
  lag_seconds: number | null;
  /** healthy / warning / offline; на всякий случай допускаем и другие значения */
  status: SourceHealthStatus | (string & {});
  health_warning_after_seconds: number;
  health_offline_after_seconds: number;
}

export type SourceSampleEvent = Record<string, unknown>;

export interface SourceSampleEventsType {
  source_id: string;
  source_name: string;
  normalization_profile: string | null;
  items: SourceSampleEvent[];
  count: number;
  detected_fields: string[];
  detected_fields_count: number;
}
