import type { EngineSettings, EngineSettingsSectionKey } from "../model/types";

// Значения по умолчанию и ограничения — из OpenAPI (EngineSettingsSchema и вложенные *Config)

export const DEFAULT_ENGINE_SETTINGS: EngineSettings = {
  settings_id: "default",
  correlation: {
    aggregation_window_seconds: 60,
    attack_ttl_seconds: 900,
    campaign_ttl_seconds: 1800,
  },
  ioc_scoring: {
    boost_critical: 10,
    boost_high: 10,
    boost_medium: 5,
    boost_low: 0,
    min_score_critical: 90,
    min_score_high: 70,
    min_score_medium: 50,
    min_score_low: 30,
  },
  asset_scoring: { boost_critical: 10, boost_high: 5, boost_medium: 0, boost_low: 0 },
  decision: { critical_score: 90, high_score: 70, medium_score: 50, low_score: 30 },
  attack_tracker: { attack_timeout_minutes: 15, campaign_timeout_minutes: 30 },
};

export type EngineSettingsField = {
  key: string;
  label: string;
  /** Подсказка у иконки «i» — описание поля из OpenAPI */
  hint: string;
  unit?: string;
  min?: number;
  max?: number;
  /** Строго больше (exclusiveMinimum) */
  exclusiveMin?: number;
};

export type EngineSettingsSection = {
  key: EngineSettingsSectionKey;
  title: string;
  description: string;
  /** Группы полей: несколько групп выводятся колонками с разделителем (IOC Scoring) */
  groups: EngineSettingsField[][];
};

const seconds = { unit: "сек.", exclusiveMin: 0 };
const minutes = { unit: "мин.", exclusiveMin: 0 };
const percent = { min: 0, max: 100 };

export const ENGINE_SETTINGS_SECTIONS: EngineSettingsSection[] = [
  {
    key: "correlation",
    title: "Корреляция (Correlation)",
    description: "Параметры формирования инцидентов, атак и кампаний.",
    groups: [
      [
        { key: "aggregation_window_seconds", label: "Окно агрегации событий", hint: "Интервал, в котором события объединяются для корреляции", ...seconds },
        { key: "attack_ttl_seconds", label: "TTL атаки (время жизни)", hint: "Время жизни атаки", ...seconds },
        { key: "campaign_ttl_seconds", label: "TTL кампании (время жизни)", hint: "Время жизни кампании", ...seconds },
      ],
    ],
  },
  {
    key: "ioc_scoring",
    title: "Оценка по индикаторам (IOC Scoring)",
    description: "Весовые коэффициенты и пороги для IOC.",
    groups: [
      [
        { key: "boost_critical", label: "Бонус: Critical", hint: "Надбавка за IOC уровня critical" },
        { key: "boost_high", label: "Бонус: High", hint: "Надбавка за IOC уровня high" },
        { key: "boost_medium", label: "Бонус: Medium", hint: "Надбавка за IOC уровня medium" },
        { key: "boost_low", label: "Бонус: Low", hint: "Надбавка за IOC уровня low" },
      ],
      [
        { key: "min_score_critical", label: "Мин. балл для Critical", hint: "Минимальный score IOC для уровня critical", ...percent },
        { key: "min_score_high", label: "Мин. балл для High", hint: "Минимальный score IOC для уровня high", ...percent },
        { key: "min_score_medium", label: "Мин. балл для Medium", hint: "Минимальный score IOC для уровня medium", ...percent },
        { key: "min_score_low", label: "Мин. балл для Low", hint: "Минимальный score IOC для уровня low", ...percent },
      ],
    ],
  },
  {
    key: "asset_scoring",
    title: "Оценка по активам (Asset Scoring)",
    description: "Дополнительные баллы в зависимости от критичности актива.",
    groups: [
      [
        { key: "boost_critical", label: "Бонус: Critical", hint: "Надбавка для критичного актива", ...percent },
        { key: "boost_high", label: "Бонус: High", hint: "Надбавка для актива высокой критичности", ...percent },
        { key: "boost_medium", label: "Бонус: Medium", hint: "Надбавка для актива средней критичности", ...percent },
        { key: "boost_low", label: "Бонус: Low", hint: "Надбавка для актива низкой критичности", ...percent },
      ],
    ],
  },
  {
    key: "decision",
    title: "Принятие решения (Decision)",
    description: "Пороговые значения итогового балла для присвоения уровня серьёзности.",
    groups: [
      [
        { key: "critical_score", label: "Critical ≥", hint: "Порог risk score для уровня critical", ...percent },
        { key: "high_score", label: "High ≥", hint: "Порог risk score для уровня high", ...percent },
        { key: "medium_score", label: "Medium ≥", hint: "Порог risk score для уровня medium", ...percent },
        { key: "low_score", label: "Low ≥", hint: "Порог risk score для уровня low", ...percent },
      ],
    ],
  },
  {
    key: "attack_tracker",
    title: "Трекер атак и кампаний (Attack Tracker)",
    description: "Тайм-ауты для автоматического завершения атак и кампаний.",
    groups: [
      [
        { key: "attack_timeout_minutes", label: "Тайм-аут атаки", hint: "Тайм-аут атаки без активности", ...minutes },
        { key: "campaign_timeout_minutes", label: "Тайм-аут кампании", hint: "Тайм-аут кампании без активности", ...minutes },
      ],
    ],
  },
];
