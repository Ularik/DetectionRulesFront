export type ANALYST_STATUS =
  | "new"
  | "in_review"
  | "confirmed"
  | "false_positive"
  | "closed";

export interface IncidentParams {
  page: number;
  size: number;
  organization_id?: string;
  from_time?: string;
  to_time?: string;
  source_ip?: string;
  destination_ip?: string;
  host?: string;
  user?: string;
  attack_type?: string;
  severity?: string;
  analyst_status?: ANALYST_STATUS;
  decision?: string;
  action?: string;
  priority?: number;
  suppressed?: boolean;
  mitre_id?: string;
  campaign_id?: string;
  incident_id?: string;
  risk_score_min?: number;
  risk_score_max?: number;
  detection_category?: string;
  source_id?: string;
  text?: string;
}

export interface IncidentLite {
  incident_id: string;
  start_time: string;
  end_time: string | null;
  severity: "low" | "medium" | "high" | "critical";
  risk_score: number;
  priority: number;
  analyst_status: ANALYST_STATUS;
  organization_id: string;
  attack_type: string;
  source_ip: string | null;
  source_user: string | null;
  observer_host: string;
  destination_ip: string | null;
  destination_host: string | null;
  decision: "decision " | "malicious";
  action: "monitor" | "block" | "investigate";
  suppressed: boolean;
  event_count: number;
  scenario_count: number;
  raw_event_count: number;
  ioc_match_count: number;
}

export interface IncidentLiteForScenario {
  incident_id: string;
  start_time: string | Date;
  end_time: string | Date;
  severity: string;
  risk_score: number;
  priority: number;
  attack_type: string;
  source_ip?: string | null;
  source_user?: string | null;
  observer_host?: string | null;
  destination_ip?: string | null;
  destination_host?: string | null;
  decision: string;
  action: string;
  organization_id?: string | null;
  event_count: number;
}

export interface IncidentApiResponse {
  items: IncidentLite[];
  total: number;
  page: number;
  size: number;
}

// ==========================================
// Вложенные структуры и служебные типы
// ==========================================

export interface ElasticEventRef {
  index: string;
  id: string;
}

export interface ScoreBreakdown {
  mitre: string;
  technique: string;
  base: number;
  final: number;
}

export interface MitreInfo {
  ids: string[];
  tactics: string[];
  techniques: string[];
}

export interface IncidentLinks {
  raw_events: string;
}

// ==========================================
// Основной объект Incident
// ==========================================

export interface Incident {
  // Метаданные и временные метки
  "@timestamp": string; // ISO 8601 string
  incident_id: string;
  organization_id: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number;

  // Классификация и риск
  attack_type: string;
  mitre_ids: string[];
  tactics: string[];
  kill_chain: string;
  attack_id: string | null;
  campaign_id: string | null;
  scenario_ids: string[];
  risk_score: number;
  severity: string;
  decision: string;
  action: string;
  priority: number;
  score_breakdown: ScoreBreakdown | null;

  // Сетевые параметры и хосты
  source_ip: string | null;
  source_ips: string[];
  source_users: string[];
  source_hosts: string[];
  observer_host: string | null;
  destination_ip: string | null;
  destination_ips: string[];
  destination_host: string | null;
  destination_hosts: string[];
  target_ports: number[];
  target_users: string[];

  // Обогащение по активам (из спецификации)
  asset_id?: string | null;
  asset_hostname?: string | null;
  asset_type?: string | null;
  asset_criticality?: string | null;
  asset_tags?: string[];

  // Метрики и сессия
  event_count: number;
  micro_incidents: number;
  unique_sources: number;
  has_success: boolean;
  session_key: string | null;

  // Источники и логи
  elastic_event_refs: ElasticEventRef[];
  source_ids?: string[];
  log_source_types: string[];
  szi_sources: string[];
  product_names: string[];
  vendor_names: string[];

  // Payload и Web контекст
  payloads: string[];
  payload_type: string | null;
  payload_indicators: string[];
  request_uris: string[];
  urls: string[];
  http_methods: string[];
  http_statuses: number[];
  user_agents: string[];

  // Детекция и правила
  event_actions: string[];
  signatures: string[];
  signature_ids: string[];
  attack_names: string[];
  detection_rule_ids: string[];
  detection_rule_descriptions: string[];
  detection_categories: string[];
  detection_confidences: number[];
  severity_hints: string[];
  scenario_type: string | null;
  recommendations: string[];

  // Windows / EDR / Системный контекст
  event_codes: string[];
  winlog_channels: string[];
  computer_names: string[];
  process_names: string[];
  process_paths: string[];
  process_command_lines: string[];
  parent_process_names: string[];
  parent_process_paths: string[];
  parent_process_command_lines: string[];
  file_paths: string[];
  registry_keys: string[];
  service_names: string[];
  task_names: string[];

  // Контекст файлов и хэши (из спецификации)
  file_hashes?: string[];
  md5_hashes?: string[];
  sha1_hashes?: string[];
  sha256_hashes?: string[];

  // Подавление (Suppression)
  suppressed: boolean;
  suppression_mode: string | null;
  suppression_rule: string | null;
  suppression_reason: string | null;

  // Аналитика и объяснения
  explanation: string[] | null;
  ai_analysis: string | null;
  extra: string;

  // Встроенные события (опционально по спецификации)
  events?: string[];

  // Служебные поля Elastic / Аналитика
  _elastic_index: string;
  _elastic_id: string;
  analyst_status: ANALYST_STATUS;
}

// ==========================================
// Корневой ответ API (IncidentSchema)
// ==========================================

export interface IncidentSchema {
  incident: Incident;
  scenario_ids: string[];
  related_scenarios: string[];
  raw_event_count: number;
  ioc_match_count: number;
  ioc_matches: string[];
  mitre: MitreInfo;
  links: IncidentLinks;
}


