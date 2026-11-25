import type { FilterBarField } from "@/shared/ui/filter-bar";
import type { RawEventsQueryParamsSchema } from "@/entities/event";

export type EventFilterParams = Omit<RawEventsQueryParamsSchema, "page" | "size" | "from_time" | "to_time"> & {
  from_time?: string;
  to_time?: string;
};
export type EventFilterKey = keyof EventFilterParams;
/** Поля меню «Добавить фильтр» (поиск и период задаются отдельно) */
export type EventChipFilterKey = Exclude<EventFilterKey, "text" | "from_time" | "to_time">;

// Параметры GET /events/
export const eventFilterFields: FilterBarField<EventChipFilterKey>[] = [
  { name: "source_ip", label: "Source IP" },
  { name: "destination_ip", label: "Destination IP" },
  { name: "host", label: "Host" },
  { name: "user", label: "User" },
  { name: "agent_name", label: "Agent name" },
  { name: "agent_ip", label: "Agent IP" },
  { name: "location", label: "Location" },
  { name: "decoder", label: "Decoder" },
  { name: "program_name", label: "Program" },
  { name: "rule_id", label: "Rule ID" },
];

export function applyEventFilterValue(
  filters: EventFilterParams,
  key: EventChipFilterKey,
  rawValue: string,
): EventFilterParams | null {
  const value = rawValue.trim();
  return value ? { ...filters, [key]: value } : null;
}

export function removeEventFilter(filters: EventFilterParams, key: EventFilterKey) {
  const next = { ...filters };
  delete next[key];
  return next;
}

export function getEventChips(filters: EventFilterParams) {
  return eventFilterFields.flatMap((field) => {
    const value = filters[field.name];
    return value ? [{ field, value: String(value) }] : [];
  });
}
