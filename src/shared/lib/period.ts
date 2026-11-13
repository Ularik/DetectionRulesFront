// Период «с — по» для фильтров списков (инциденты, raw data)

// "2024-09-01" → ISO начала или конца дня по местному времени
export function dateInputToIso(value: string, edge: "start" | "end") {
  if (!value) return undefined;
  const date = new Date(`${value}T${edge === "start" ? "00:00:00" : "23:59:59.999"}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// ISO → "2024-09-01" для <input type="date">
export function isoToDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

function formatMonth(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "…";
  const label = monthFormatter.format(date).replace(/\s*г\.$/, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** «Сентябрь 2024 — Сентябрь 2026» */
export function formatPeriod(from?: string, to?: string) {
  if (!from && !to) return "За всё время";
  return `${from ? formatMonth(from) : "…"} — ${to ? formatMonth(to) : "сейчас"}`;
}
