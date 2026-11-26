import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// Единая раскладка страниц дашборда: заголовок → строка поиска/фильтров → контент, отступ 20px.
// Все страницы занимают всю ширину <main> (без собственных max-w/mx-auto), чтобы ширина контента совпадала
export const pageStackClass = "flex min-w-0 flex-col gap-5";

// Заголовок страницы: h1 + подзаголовок слева, действия справа. Подзаголовок обязателен,
// чтобы высота шапки и уровень строки поиска были одинаковыми на всех вкладках
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex min-h-14 flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl leading-8 font-semibold break-words text-ink">{title}</h1>
        <p className="mt-1 text-sm leading-5 text-ink-muted">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
