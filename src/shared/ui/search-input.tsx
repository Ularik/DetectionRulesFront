"use client";

import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Строка поиска списков (h-11), одинаковая на всех страницах; растягивается на свободную ширину строки
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block min-w-[240px] flex-1", className)}>
      <Search
        aria-hidden="true"
        className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
      />
    </label>
  );
}
