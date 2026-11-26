import { DEFAULT_ENGINE_SETTINGS, type EngineSettingsField } from "../config/fields";
import type { EngineSettings, EngineSettingsResponse, EngineSettingsSectionKey } from "../model/types";

const SECTION_KEYS: EngineSettingsSectionKey[] = [
  "correlation",
  "ioc_scoring",
  "asset_scoring",
  "decision",
  "attack_tracker",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === "string" && value ? value : null);

// EngineSettingsResponseSchema: у всех полей backend есть значения по умолчанию, поэтому
// отсутствующие разделы и поля дополняем DEFAULT_ENGINE_SETTINGS (как это делает сам движок)
export function normalizeEngineSettings(raw: unknown): EngineSettingsResponse {
  const body = isRecord(raw) ? raw : {};

  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => {
      const source = isRecord(body[key]) ? body[key] : {};
      const defaults = DEFAULT_ENGINE_SETTINGS[key] as unknown as Record<string, number>;
      const merged = Object.fromEntries(
        Object.entries(defaults).map(([field, fallback]) => {
          const value = source[field];
          return [field, typeof value === "number" && Number.isFinite(value) ? value : fallback];
        }),
      );
      return [key, merged];
    }),
  ) as unknown as Omit<EngineSettings, "settings_id">;

  return {
    settings_id: asString(body.settings_id) ?? DEFAULT_ENGINE_SETTINGS.settings_id,
    ...sections,
    updated_by: asString(body.updated_by) ?? "system",
    updated_at: asString(body.updated_at),
  };
}

// Текст ошибки для значения поля; null — значение корректно
export function validateEngineSettingsValue(field: EngineSettingsField, raw: string): string | null {
  if (raw.trim() === "") return "Укажите значение";
  const value = Number(raw);
  if (!Number.isInteger(value)) return "Только целое число";
  if (field.exclusiveMin !== undefined && value <= field.exclusiveMin) return `Больше ${field.exclusiveMin}`;
  if (field.min !== undefined && value < field.min) return `Не меньше ${field.min}`;
  if (field.max !== undefined && value > field.max) return `Не больше ${field.max}`;
  return null;
}

// «20.08.2026 10:31 (UTC)»
export function formatEngineSettingsDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = date.toLocaleString("ru-RU", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatted.replace(",", "")} (UTC)`;
}
