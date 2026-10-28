"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export interface PaginationControlProps {
  /** Текущая страница (начиная с 1) */
  page: number;
  /** Текущий лимит элементов на странице */
  limit: number;
  /** Общее количество элементов */
  total: number;
  /** Функция изменения текущей страницы */
  onPageChange: (newPage: number) => void;
  /** Функция изменения лимита элементов (опционально) */
  onLimitChange?: (newLimit: number) => void;
  /** Заблокировать кнопки (например, при загрузке) */
  isLoading?: boolean;
  /** Доступные варианты выбора количества элементов */
  pageSizeOptions?: number[];
  /** Подпись к счётчику: «1–8 из 8 {itemsLabel}» */
  itemsLabel?: string;
  className?: string;
}

// Сколько номеров страниц показывать одновременно
const VISIBLE_PAGES = 5;

function getVisiblePages(page: number, totalPages: number) {
  const count = Math.min(VISIBLE_PAGES, totalPages);
  const start = Math.min(
    Math.max(1, page - Math.floor(VISIBLE_PAGES / 2)),
    totalPages - count + 1,
  );
  return Array.from({ length: count }, (_, index) => start + index);
}

const pageButtonClass =
  "flex size-8 items-center justify-center rounded-[10px] border text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-50";

export function PaginationControl({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  isLoading = false,
  pageSizeOptions = [5, 10, 20, 50],
  itemsLabel,
  className,
}: PaginationControlProps) {
  // Расчет общего количества страниц
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Расчет выводимого диапазона "startItem–endItem из total"
  const offset = (page - 1) * limit;
  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + limit, total);

  const handleLimitSelect = (value: string | null) => {
    if (value !== null && onLimitChange) {
      onLimitChange(Number(value));
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 border-t border-line-muted pt-4 sm:flex-row",
        className,
      )}
    >
      {/* Левая часть: Выбор количества элементов и счетчик */}
      <div className="flex items-center gap-2 text-[13px] text-ink-muted">
        {onLimitChange && (
          <>
            <span>Показывать по:</span>
            <Select
              value={String(limit)}
              onValueChange={handleLimitSelect}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-18 border-line bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        <span>
          {startItem}–{endItem} из {total}
          {itemsLabel && ` ${itemsLabel}`}
        </span>
      </div>

      {/* Правая часть: Переключение страниц */}
      <nav aria-label="Страницы" className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
          aria-label="Предыдущая страница"
          className={cn(pageButtonClass, "border-line bg-white text-ink hover:bg-surface-muted")}
        >
          <ChevronLeft className="size-4" />
        </button>

        {getVisiblePages(page, totalPages).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            disabled={isLoading}
            aria-current={pageNumber === page ? "page" : undefined}
            className={cn(
              pageButtonClass,
              pageNumber === page
                ? "border-brand bg-brand font-semibold text-white"
                : "border-line bg-white text-ink-muted hover:bg-surface-muted",
            )}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || isLoading}
          aria-label="Следующая страница"
          className={cn(pageButtonClass, "border-line bg-white text-ink hover:bg-surface-muted")}
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
