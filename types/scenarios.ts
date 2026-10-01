import { IncidentLiteForScenario } from "./incidents";
import type { IocType } from "./ioc";
import { MitreType } from "./mitre";

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


// 2. Вложенный объект ссылок
export interface LinksSchema {
  /** Ссылка на сырые события */
  raw_events?: string | null;
  /** Ссылки на инциденты */
  incidents: string[];
}

// 3. Детальная схема сценария (ScenarioDetailSchema)
export interface ScenarioDetailType {
  scenario_id: string;
  scenario_key?: string | null;
  scenario_type?: string | null;
  status: string;
  engine_status: string;
  analyst_status: string;

  // Временные метки (в JSON передаются строками ISO 8601)
  first_seen?: string | Date | null;
  last_seen?: string | Date | null;

  // Сетевые и субъектные атрибуты
  source_ip?: string | null;
  source_ips: string[];
  source_user?: string | null;
  source_users: string[];
  source_hosts: string[];
  observer_host?: string | null;
  destination_ip?: string | null;
  destination_ips: string[];
  destination_host?: string | null;
  destination_hosts: string[];

  // Данные об активе (Asset)
  asset_id?: string | null;
  asset_hostname?: string | null;
  asset_type?: string | null;
  asset_criticality?: string | null;
  asset_tags: string[];

  // Запросы и полезная нагрузка
  request_uris: string[];
  payloads: string[];
  signatures: string[];

  // Хэши файлов
  file_hashes: string[];
  md5_hashes: string[];
  sha1_hashes: string[];
  sha256_hashes: string[];

  // Детекты и правила
  detection_rule_ids: string[];
  detection_categories: string[];
  detection_rule_descriptions: string[];
  recommendations: string[];

  // Индикаторы компрометации (IoC)
  ioc_matches: IocType[];
  ioc_match_count: number;
  ioc_severity?: string | null;
  ioc_confidence?: number | null;

  // Блеклисты
  blacklisted: boolean;
  blacklist_sources: string[];
}

// 5. Итоговая агрегирующая схема (ScenarioAggregateSchema)
export interface ScenarioAggregateSchema {
  /** Детальная информация о сценарии */
  scenario: ScenarioDetailType;
  incident_count: number;
  related_incidents: IncidentLiteForScenario[];
  related_incident_count: number;
  raw_event_count: number;
  ioc_match_count: number;
  ioc_matches: unknown[];
  mitre: MitreType;
  links?: LinksSchema | null;
}