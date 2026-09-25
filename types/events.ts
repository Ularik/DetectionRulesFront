export interface RawData {
  [key: string]: Record<string, unknown>;
}

export interface NewEventType {
  timestamp: string; // ISO 8601 дата-время
  timestamp_raw?: string;

  // Сетевые параметры
  source_ip?: string;
  source_user?: string;
  source_host?: string;
  destination_ip?: string;
  destination_host?: string;
  dst_port?: number;
  observer_host?: string;

  // Правила и сигнатуры
  rule_id?: string;
  rule_level?: number;
  rule_name?: string;
  rule_groups?: string[];
  signature?: string;
  signature_id?: string;
  attack_name?: string;

  // MITRE ATT&CK
  mitre_ids?: string[];
  mitre_tactics?: string[];
  mitre_techniques?: string[];

  // Детекция и классификация
  event_type: string; // По умолчанию "unknown"
  action?: string;
  outcome?: string;
  detection_rule_id?: string;
  detection_rule_description?: string;
  detection_category?: string;
  detection_confidence?: number;
  severity_hint?: string;
  attack_type?: string;
  scenario_type?: string;
  explanation_template?: string;
  recommendations?: string[];

  // Источник логов и Вендор
  log_source_type?: string;
  szi_source?: string;
  product_name?: string;
  vendor_name?: string;

  // HTTP параметры
  request_uri?: string;
  url?: string;
  http_method?: string;
  http_status?: number;
  user_agent?: string;
  referrer?: string;

  // Пейлоад
  payloads?: string[];
  payload_type?: string;
  payload_indicators?: string[];

  // Системные события Windows / ОС
  event_code?: string;
  winlog_channel?: string;
  computer_name?: string;

  // Процессы
  process_name?: string;
  process_path?: string;
  process_command_line?: string;
  process_pid?: string;
  parent_process_name?: string;
  parent_process_path?: string;
  parent_process_command_line?: string;
  parent_process_pid?: string;

  // Авторизация и УЗ
  target_user?: string;
  logon_type?: string;
  logon_id?: string;

  // Файлы и хеши
  file_path?: string;
  file_hash?: string;
  md5_hash?: string;
  sha1_hash?: string;
  sha256_hash?: string;

  // Системные объекты
  registry_key?: string;
  service_name?: string;
  task_name?: string;

  // Произвольные сырые данные
  raw?: RawData;
}

export interface EventPayload {
  event: Event;
}
