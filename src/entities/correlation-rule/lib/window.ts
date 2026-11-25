// window_seconds редактируется как число + единица (секунды/минуты/часы)

export type WindowUnit = "seconds" | "minutes" | "hours";

export const WINDOW_UNITS: { value: WindowUnit; label: string; seconds: number }[] = [
  { value: "seconds", label: "секунд", seconds: 1 },
  { value: "minutes", label: "минут", seconds: 60 },
  { value: "hours", label: "часов", seconds: 3600 },
];

/** Самая крупная единица, в которой окно выражается целым числом */
export function splitWindow(seconds: number): { amount: number; unit: WindowUnit } {
  const unit =
    [...WINDOW_UNITS].reverse().find((item) => seconds > 0 && seconds % item.seconds === 0) ??
    WINDOW_UNITS[0];
  return { amount: seconds / unit.seconds, unit: unit.value };
}

export const windowToSeconds = (amount: number, unit: WindowUnit) =>
  amount * (WINDOW_UNITS.find((item) => item.value === unit)?.seconds ?? 1);

const plural = (value: number, forms: [string, string, string]) => {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
};

/** Окно в винительном падеже для «за …»: «1 минуту», «2 часа», «10 минут» */
export function formatWindow(seconds: number) {
  const { amount, unit } = splitWindow(seconds);
  const forms: Record<WindowUnit, [string, string, string]> = {
    seconds: ["секунду", "секунды", "секунд"],
    minutes: ["минуту", "минуты", "минут"],
    hours: ["час", "часа", "часов"],
  };
  return `${amount} ${plural(amount, forms[unit])}`;
}
