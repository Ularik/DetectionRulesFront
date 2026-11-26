// Качество нормализации (backend «Data Quality», /data-quality/*). Схемы ответов в OpenAPI не описаны —
// поля сняты с реальных ответов. Каждое событие оценивается как good / warning / error:
// warning — событие нормализовано, но часть полей профиля не заполнена; error — ошибка разбора

export interface DataQualityFieldCount {
  field: string;
  count: number;
}

/** Формат элементов parse_errors_top backend не зафиксировал — допускаем строку или объект */
export type DataQualityParseError = string | ({ count?: number } & Record<string, unknown>);

export interface DataQualityStats {
  bucket_count: number;
  total_events: number;
  good_events: number;
  warning_events: number;
  error_events: number;
  good_percent: number;
  warning_percent: number;
  error_percent: number;
  avg_coverage_percent: number;
  missing_fields_total: number;
  missing_fields_top: DataQualityFieldCount[];
  parse_errors_total: number;
  parse_errors_top: DataQualityParseError[];
  first_event_at: string | null;
  last_event_at: string | null;
  last_error_at: string | null;
}

/** GET /data-quality/summary и GET /data-quality/sources/{id} */
export interface DataQualitySummary extends DataQualityStats {
  hours: number;
  organization_id: string | null;
  source_id: string | null;
  profile_name: string | null;
}

export interface DataQualitySource extends DataQualityStats {
  /** "__unresolved__" — события, которые не удалось отнести к источнику */
  source_id: string;
  source_name: string;
  organization_id: string | null;
  profiles: string[];
}

/** GET /data-quality/sources */
export interface DataQualitySourcesResponse {
  hours: number;
  organization_id: string | null;
  items: DataQualitySource[];
  count: number;
}

export interface DataQualityParams {
  hours: number;
  organization_id?: string;
  profile_name?: string;
}
