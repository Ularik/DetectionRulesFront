import {
  INCIDENT_STATUS_LABELS,
  isAnalystStatus,
} from "@/entities/incident";

export type SortState<Key extends string> = { key: Key; direction: "asc" | "desc" } | null;

// Сортировка в пределах загруженной страницы, как в таблице инцидентов
export function sortItems<Item, Key extends string>(
  items: Item[],
  sort: SortState<Key>,
  getValue: (item: Item, key: Key) => string | number,
) {
  if (!sort) return items;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = getValue(a, sort.key);
    const right = getValue(b, sort.key);
    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * factor;
    }
    return String(left).localeCompare(String(right), "ru", { numeric: true }) * factor;
  });
}

const withSeconds = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "medium" });
const withoutSeconds = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short" });

// "2026-10-01 06:53[:42]" по местному времени
export function formatDateTime(value: string | Date | null | undefined, seconds = true) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return (seconds ? withSeconds : withoutSeconds).format(date);
}

export function getAnalystStatusLabel(status: string | null | undefined) {
  if (!status) return "—";
  return isAnalystStatus(status) ? INCIDENT_STATUS_LABELS[status] : status;
}
