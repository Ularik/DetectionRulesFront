"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { useNormalizationFields } from "@/entities/normalization-profile";

// «Поля нормализации» — каталог внутренних полей SIEM, доступных для field_mapping
export function FieldsCatalog() {
  const { data, isPending, isError, refetch } = useNormalizationFields();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const query = search.trim().toLowerCase();
  const categories = data?.categories ?? [];
  const items = (data?.items ?? [])
    .filter((field) => !category || field.category === category)
    .filter(
      (field) =>
        !query ||
        [field.field, field.label, field.description, ...field.example_source_fields].some((value) =>
          value.toLowerCase().includes(query),
        ),
    );
  const categoryLabel = new Map(categories.map((item) => [item.id, item.label]));

  return (
    <section className="flex flex-col gap-5">
      <header>
        <Link
          href={routes.normalizationProfiles}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand-light"
        >
          <ArrowLeft className="h-4 w-4" />К профилям нормализации
        </Link>
        <h1 className="text-2xl font-bold text-ink">Поля нормализации</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Внутренние поля SOC Engine, которые можно заполнять через сопоставление полей в профилях.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-[240px] flex-1">
          <Search aria-hidden className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по полю, названию или полю источника"
            aria-label="Поиск полей"
            className="h-11 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Категории полей">
        {[{ id: "", label: "Все" }, ...categories].map((item) => (
          <button
            key={item.id || "all"}
            type="button"
            role="tab"
            aria-selected={category === item.id}
            onClick={() => setCategory(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              category === item.id
                ? "border-brand-light bg-brand-light text-white"
                : "border-line bg-white text-ink hover:border-brand-soft",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить каталог полей</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-line-muted bg-surface-muted text-left text-[13px] font-semibold text-ink">
                <tr>
                  <th className="px-4 py-3">Поле</th>
                  <th className="px-3 py-3">Категория</th>
                  <th className="px-3 py-3">Тип</th>
                  <th className="px-3 py-3">Описание</th>
                  <th className="px-4 py-3">Типичные поля источника</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {isPending ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-8 rounded bg-line-muted" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center text-ink-muted">
                      Ничего не найдено
                    </td>
                  </tr>
                ) : (
                  items.map((field) => (
                    <tr key={field.field} className="align-top">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-ink">{field.field}</span>
                        {field.required && <span className="ml-1 text-red-500" title="Обязательное">*</span>}
                        <span className="block text-xs text-ink-muted">{field.label}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-ink">
                        {categoryLabel.get(field.category) ?? field.category}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs text-ink ring-1 ring-line-muted">
                          {field.type}
                        </span>
                      </td>
                      <td className="max-w-[320px] px-3 py-3 text-xs text-ink">{field.description}</td>
                      <td className="max-w-[300px] px-4 py-3 font-mono text-xs break-words text-ink-muted">
                        {field.example_source_fields.join(", ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
