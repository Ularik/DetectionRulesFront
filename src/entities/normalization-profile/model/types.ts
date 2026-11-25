// Профиль нормализации (backend «Профили нормализации», /normalization-profiles).
// Схемы ответов в OpenAPI не описаны — поля сняты с ответов backend

export const NORMALIZATION_FORMATS = ["json", "syslog", "cef", "leef", "kv", "text"] as const;
export type NormalizationFormat = (typeof NORMALIZATION_FORMATS)[number];

/** Поле SOC Engine → альтернативные имена полей в событиях источника */
export type FieldMapping = Record<string, string[]>;

// NormalizationProfileSchema — и ответ GET, и тело POST/PUT
export interface NormalizationProfileType {
  source_name: string;
  source_type: string;
  format: NormalizationFormat | (string & {});
  enabled: boolean;
  description: string;
  field_mapping: FieldMapping;
}

export interface NormalizationProfileListApiResponse {
  items: NormalizationProfileType[];
  count: number;
}

// GET /normalization-profiles/fields — каталог внутренних полей SIEM
export interface NormalizationFieldType {
  field: string;
  label: string;
  category: string;
  type: string;
  required: boolean;
  description: string;
  example_source_fields: string[];
}

export interface NormalizationFieldCategory {
  id: string;
  label: string;
}

export interface NormalizationFieldsApiResponse {
  items: NormalizationFieldType[];
  categories: NormalizationFieldCategory[];
  count: number;
}

// POST /normalization-profiles/test
export interface NormalizationTestRequest {
  profile: NormalizationProfileType;
  raw_event: Record<string, unknown>;
}

export interface NormalizationQuality {
  quality_status: string;
  configured_fields: number;
  mapped_fields_count: number;
  missing_mapped_fields_count: number;
  coverage_percent: number;
  mapped_fields: { field: string; source_field: string }[];
  missing_mapped_fields: (string | { field: string; [key: string]: unknown })[];
  parse_errors: unknown[];
  warnings: unknown[];
}

export interface NormalizationTestResult {
  profile_name: string;
  source_type: string;
  /** Поля в терминах профиля (как в field_mapping) + служебные szi_source, raw и т.п. */
  unified: Record<string, unknown>;
  /** Итоговая нормализованная запись SOC Engine */
  normalized: Record<string, unknown>;
  quality: NormalizationQuality;
}
