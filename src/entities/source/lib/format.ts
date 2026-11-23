const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

// «23.11.2026 · 15:07» — как в карточке источника на макете
export function formatSourceDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

// 300 → «300 сек. (5 минут)»
export function formatThreshold(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  const minutes = seconds / 60;
  return Number.isInteger(minutes) && minutes > 0
    ? `${seconds} сек. (${minutes} ${pluralMinutes(minutes)})`
    : `${seconds} сек.`;
}

export function formatSeconds(seconds: number | null | undefined) {
  return seconds == null ? "—" : `${seconds} сек.`;
}

function pluralMinutes(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "минута";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "минуты";
  return "минут";
}
