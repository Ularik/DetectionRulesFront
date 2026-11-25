import { cn } from "@/shared/lib/utils";

// «● Активен» — точка и подпись, как в таблице профилей на макете
export function ProfileStatus({ enabled, className }: { enabled: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
        enabled ? "text-emerald-700" : "text-ink-muted",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 rounded-full", enabled ? "bg-emerald-500" : "bg-gray-400")}
      />
      {enabled ? "Активен" : "Отключён"}
    </span>
  );
}

// Бейдж «Активен» в шапке карточки профиля
export function ProfileStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5",
        enabled ? "bg-emerald-50" : "bg-gray-100",
      )}
    >
      <ProfileStatus enabled={enabled} />
    </span>
  );
}
