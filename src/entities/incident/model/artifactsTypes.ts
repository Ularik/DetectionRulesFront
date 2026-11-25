// GET /incidents/{inc_id}/artifacts — технические признаки из связанных RAW-событий инцидента.
// Схема ответа в OpenAPI не описана — поля сняты с реального ответа.
// Дедупликации нет; пагинация (page/size) применяется к исходным событиям, а не к артефактам

export interface IncidentArtifact {
  /** command, ip, file, hash, … — набор типов на backend не зафиксирован */
  type: string;
  value: string;
  /** Поле RAW-события, из которого извлечён артефакт (data.command, syscheck.path, …) */
  field: string;
}

export interface IncidentArtifactEvent {
  event_id: string;
  timestamp: string | null;
  hostname: string | null;
  source_id: string | null;
  source_name: string | null;
  action: string | null;
  rule_id: string | null;
  rule_description: string | null;
  rule_level: number | null;
  mitre_ids: string[];
  artifacts: IncidentArtifact[];
  artifact_count: number;
  event_ref: { index: string; id: string } | null;
  raw_url: string | null;
}

export interface IncidentArtifactsResponse {
  incident_id: string;
  organization_id: string | null;
  items: IncidentArtifactEvent[];
  total: number;
  page: number;
  size: number;
  returned: number;
  /** Ссылки на события, которые не удалось прочитать из Elastic */
  missing: unknown[];
  missing_count: number;
}
