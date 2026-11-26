// Схемы backend: EngineSettingsSchema и вложенные *Config (раздел OpenAPI «Настройки движка»)

export interface CorrelationConfig {
  aggregation_window_seconds: number;
  attack_ttl_seconds: number;
  campaign_ttl_seconds: number;
}

export interface IocScoringConfig {
  boost_critical: number;
  boost_high: number;
  boost_medium: number;
  boost_low: number;
  min_score_critical: number;
  min_score_high: number;
  min_score_medium: number;
  min_score_low: number;
}

export interface AssetScoringConfig {
  boost_critical: number;
  boost_high: number;
  boost_medium: number;
  boost_low: number;
}

export interface DecisionConfig {
  critical_score: number;
  high_score: number;
  medium_score: number;
  low_score: number;
}

export interface AttackTrackerConfig {
  attack_timeout_minutes: number;
  campaign_timeout_minutes: number;
}

/** Тело PUT /engine-settings и POST /engine-settings/validate */
export interface EngineSettings {
  settings_id: string;
  correlation: CorrelationConfig;
  ioc_scoring: IocScoringConfig;
  asset_scoring: AssetScoringConfig;
  decision: DecisionConfig;
  attack_tracker: AttackTrackerConfig;
}

/** EngineSettingsResponseSchema — ответ GET /engine-settings (updated_by/updated_at выставляет движок) */
export interface EngineSettingsResponse extends EngineSettings {
  updated_by: string;
  /** ISO 8601 */
  updated_at: string | null;
}

/** EngineSettingsUpdateResponseSchema — ответ PUT /engine-settings и POST /engine-settings/reset */
export interface EngineSettingsUpdateResponse {
  success: boolean;
  settings: EngineSettingsResponse;
}

/** EngineSettingsValidateResponseSchema — ответ POST /engine-settings/validate */
export interface EngineSettingsValidateResponse {
  valid: boolean;
  settings: EngineSettingsResponse;
}

export type EngineSettingsSectionKey = Exclude<keyof EngineSettings, "settings_id">;
