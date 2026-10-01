// --- Перечисления (Enums и Literals) ---

export type Severity = "low" | "medium" | "high" | "critical";

export type AssetCriticality = "low" | "medium" | "high" | "critical";

// Для AnalystStatus используйте ваши значения из src/incidents/schemas
export type AnalystStatus = "new" | "in_progress" | "closed" | "resolved";

export type Decision = "malicious" | "suspicious";

export type Action = "monitor" | "block" | "investigate";

// --- Query параметры запроса ---

export interface ScenarioQueryParams {
  // Строковые и идентификационные фильтры
  organization_id?: string | null;

  // Сетевые фильтры
  source_ip?: string | null;
  destination_ip?: string | null;
  host?: string | null;
  user?: string | null;

  // Категории и типы атак
  attack_type?: string | null;
  detection_category?: string | null;

  // Enum / Literal фильтры
  severity?: Severity | null;
  analyst_status?: AnalystStatus | null;
  decision?: Decision | null;
  action?: Action | null;
  ioc_severity?: Severity | null;

  // Численные диапазоны и значения
  priority?: number | null;
  score_min?: number | null; // min: 0, max: 100
  score_max?: number | null; // min: 0, max: 100

  // Сущности и флаги
  incident_id?: string | null;
  asset_id?: string | null;
  asset_hostname?: string | null;
  blacklisted?: boolean | null;
  text?: string | null;

  // Пагинация
  page?: number; // по умолчанию: 1
  size?: number; // по умолчанию: 20
}

// --- Основная сущность сценария ---
export interface SecurityScenario {
  scenario_id?: string | null;
  scenario_type?: string | null;
  status?: string | null;
  analyst_status?: AnalystStatus | null;
  severity?: Severity | null;
  scenario_score?: number | null;
  organization_id?: string | null;

  first_seen?: string | null;
  last_seen?: string | null;

  source_ip?: string | null;
  observer_host?: string | null;
  destination_ip?: string | null;
  destination_host?: string | null;

  asset_hostname?: string | null;
  asset_criticality?: string | null;

  incident_count?: number | null;
  raw_event_count?: number | null;
  ioc_match_count?: number | null;
}
// --- Ответ API с пагинацией ---

export interface ScenarioApiResponse {
  items: SecurityScenario[];
  total: number;
  page: number;
  size: number;
}
