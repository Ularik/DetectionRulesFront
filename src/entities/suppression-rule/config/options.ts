import type {
  SuppressionAction,
  SuppressionDecision,
  SuppressionMatchSchema,
  SuppressionSeverity,
} from "../model/types";

// Значения переопределений из GET /supersession-rules/suppression-action-fields

export const SUPPRESSION_ACTIONS: { value: SuppressionAction; label: string }[] = [
  { value: "ignore", label: "Игнорировать" },
  { value: "monitor", label: "Наблюдать" },
  { value: "investigate", label: "Расследовать" },
  { value: "block", label: "Блокировать" },
];

export const SUPPRESSION_SEVERITIES: { value: SuppressionSeverity; label: string }[] = [
  { value: "critical", label: "Критическая" },
  { value: "high", label: "Высокая" },
  { value: "medium", label: "Средняя" },
  { value: "low", label: "Низкая" },
  { value: "info", label: "Информационная" },
];

export const SUPPRESSION_DECISIONS: { value: SuppressionDecision; label: string }[] = [
  { value: "benign", label: "Легитимно (benign)" },
  { value: "suspicious", label: "Подозрительно (suspicious)" },
  { value: "malicious", label: "Вредоносно (malicious)" },
];

const labelOf = (options: { value: string; label: string }[]) => (value: string | null) =>
  value ? (options.find((option) => option.value === value)?.label ?? value) : null;

export const suppressionActionLabel = labelOf(SUPPRESSION_ACTIONS);
export const suppressionSeverityLabel = labelOf(SUPPRESSION_SEVERITIES);
export const suppressionDecisionLabel = labelOf(SUPPRESSION_DECISIONS);

/** Подписи полей match — как в метаданных backend и в макете */
export const MATCH_FIELD_LABELS: Record<keyof SuppressionMatchSchema, string> = {
  source_ip: "Source IP",
  destination_ip: "Destination IP",
  dst_port: "Port",
  observer_host: "Observer host",
  attack_type: "Attack type",
  detection_rule_id: "Detection rule",
  category: "Category",
  paths: "Path",
  path_prefixes: "Path prefixes",
  contains: "Contains",
};

export const MATCH_FIELDS = Object.keys(MATCH_FIELD_LABELS) as (keyof SuppressionMatchSchema)[];
