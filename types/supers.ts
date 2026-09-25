

export type SuppressionAction = "block" | "investigate" | "monitor" | "ignore";

export type SuppressionSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export type SuppressionDecision = "malicious" | "suspicious" | "benign";

export interface SuppressionMatchTypes {
  /** IP-адрес источника */
  source_ip?: string | null;

  /** IP-адрес назначения */
  destination_ip?: string | null;

  /** Порт назначения */
  dst_port?: number | null;

  /** Хост-наблюдатель */
  observer_host?: string | null;

  /** Тип атаки */
  attack_type?: string | null;

  /** ID правила детектирования */
  detection_rule_id?: string | null;

  /** Категория */
  category?: string | null;

  /** Список путей */
  paths: string[];

  /** Префиксы путей */
  path_prefixes: string[];

  /** Содержимое */
  contains: string[];
}

export interface SuppressionActionTypes {
  /** Режим подавления */
  mode: string;
  /** Переопределение типа атаки */
  attack_type?: string | null;
  /** Решение */
  decision: SuppressionDecision;
  /** Уровень суровости */
  severity: SuppressionSeverity;
  /** Оценка риска: 0–100 */
  risk_score: number;
  /** Выполняемое действие */
  action?: SuppressionAction | null;
  /** Флаг подавления */
  suppressed: boolean;
  /** Причина подавления */
  suppression_reason: string;
}

export interface SuppressionRuleTypes {
  /** Уникальный идентификатор правила подавления */
  suppression_id: string;
  /** Статус активности правила */
  enabled: boolean;
  /** Описание правила */
  description: string;
  /** Причина создания правила */
  reason: string;
  /** Условия срабатывания правила */
  match: SuppressionMatchTypes;
  /** Действия при срабатывании */
  action: SuppressionActionTypes;
  /** Теги */
  tags: string[];
  /** Дата и время создания (ISO-строка) */
  created_at?: string | null;
  /** Дата и время обновления (ISO-строка) */
  updated_at?: string | null;
  /** Автор создания */
  created_by?: string | null;
  /** Автор последнего обновления */
  updated_by?: string | null;
}

export interface SuppresionRuleCreateType {
    enabled: boolean;
    description?: string; 
    reason?: string;
    match: SuppressionMatchTypes;
    action?: SuppressionActionTypes
    tags?: string[]
}


export interface SuppressionMatchUpdateTypes {
  source_ip: string;
  attack_type: string;
}

export type ActionType = "ignore" | "block" | "alert" | string;

export interface SuppressionRuleUpdateType {
  description: string;
  reason: string;
  match: SuppressionMatchUpdateTypes;
  action: ActionType;
  suppressed: boolean;
  suppression_reason: string;
  tags: string[];
}

export type UiControlType =
  | "input"
  | "number"
  | "select"
  | "multi_input"
  | string;
export type ValueSourceType = "manual" | "reference" | string;
export type MatchModeType = "exact" | "prefix" | "contains" | string;


export interface MatchFieldType {
  // Обязательные базовые поля
  field: string;
  label: string;
  description: string;
  type: string;
  ui_control: UiControlType;
  multiple: boolean;
  value_source: ValueSourceType;

  // Дополнительные опциональные поля
  min?: number;
  max?: number;
  reference?: string;
  reference_description?: string;
  match_mode?: MatchModeType;

  // Пример
  example?: unknown;
}


export interface FrontendRulesForMatchFields {
  select: string;
  input: string;
  number: string;
  multi_input: string;
}

export interface MatchFieldResponseType {
  items: MatchFieldType[];
  count: number;
  frontend_rules: FrontendRulesForMatchFields;
}