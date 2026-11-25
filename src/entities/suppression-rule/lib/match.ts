import { MATCH_FIELDS, MATCH_FIELD_LABELS } from "../config/options";
import type { SuppressionMatchSchema } from "../model/types";

// «Тип исключения» из макета на backend не хранится — выводится из заполненных условий match

export type ExclusionType =
  | "source_ip"
  | "destination_ip"
  | "detection_rule"
  | "attack_type"
  | "category"
  | "content"
  | "port"
  | "host"
  | "none";

export const EXCLUSION_TYPE_LABELS: Record<ExclusionType, string> = {
  source_ip: "По источнику (IP)",
  destination_ip: "По назначению (IP)",
  detection_rule: "По правилу обнаружения",
  attack_type: "По типу атаки",
  category: "По категории",
  content: "По содержимому",
  port: "По порту",
  host: "По хосту",
  none: "Без условий",
};

export const EXCLUSION_TYPES = Object.keys(EXCLUSION_TYPE_LABELS).filter(
  (type) => type !== "none",
) as Exclude<ExclusionType, "none">[];

const isFilled = (value: SuppressionMatchSchema[keyof SuppressionMatchSchema]) =>
  Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "";

/** Главное условие правила — по приоритету: IP, правило, тип атаки, категория, содержимое, порт, хост */
export function getExclusionType(match: SuppressionMatchSchema): ExclusionType {
  if (match.source_ip) return "source_ip";
  if (match.destination_ip) return "destination_ip";
  if (match.detection_rule_id) return "detection_rule";
  if (match.attack_type) return "attack_type";
  if (match.category) return "category";
  if (match.paths.length || match.path_prefixes.length || match.contains.length) return "content";
  if (match.dst_port !== null) return "port";
  if (match.observer_host) return "host";
  return "none";
}

export const hasMatchConditions = (match: SuppressionMatchSchema) =>
  MATCH_FIELDS.some((field) => isFilled(match[field]));

/** Строки «Source IP: 10.10.20.0/24» для колонки «Условия» */
export function summarizeMatch(match: SuppressionMatchSchema): string[] {
  return MATCH_FIELDS.filter((field) => isFilled(match[field])).map((field) => {
    const value = match[field];
    return `${MATCH_FIELD_LABELS[field]}: ${Array.isArray(value) ? value.join(", ") : value}`;
  });
}

/** Все значения условий — для поиска по таблице */
export const matchValues = (match: SuppressionMatchSchema) =>
  MATCH_FIELDS.flatMap((field) => {
    const value = match[field];
    if (Array.isArray(value)) return value;
    return value === null || value === undefined ? [] : [String(value)];
  });
