"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, Eye, Layers, MoreHorizontal, Plus, Search, SquarePen, Shuffle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  ProfileFormatTag,
  ProfileStatus,
  ProfileTypeTag,
  formatNormalizationFormat,
  getProfileTypeLabel,
  useNormalizationProfiles,
  type NormalizationProfileType,
} from "@/entities/normalization-profile";
import { DeleteProfileButton } from "@/features/normalization-profile/delete";

// Вёрстка по макету «Профили нормализации» (public/images/normalizations-profile.jpeg):
// шапка раздела, слева поиск + таблица профилей, справа карточка выбранного профиля (detail)

const ALL = "";

function matchesSearch(profile: NormalizationProfileType, query: string) {
  if (!query) return true;
  return [profile.source_name, profile.description, profile.source_type].some((value) =>
    value?.toLowerCase().includes(query),
  );
}

const headClass = "px-3 py-3 text-left text-[13px] font-semibold whitespace-nowrap text-ink";

const menuItemClass =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-surface-muted";

function RowMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Действия с профилем ${name}`}
          className="flex size-8 items-center justify-center rounded-md text-ink hover:bg-white"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 bg-white p-1"
        onClick={(event) => event.stopPropagation()}
      >
        <Link href={routes.normalizationProfile(name)} scroll={false} className={menuItemClass}>
          <Eye className="size-4" /> Открыть
        </Link>
        <Link href={routes.normalizationProfileEdit(name)} className={menuItemClass}>
          <SquarePen className="size-4" /> Редактировать
        </Link>
        <Link href={routes.normalizationProfileCopy(name)} className={menuItemClass}>
          <Copy className="size-4" /> Дублировать
        </Link>
        <DeleteProfileButton name={name} variant="menu" />
      </PopoverContent>
    </Popover>
  );
}

type Props = {
  /** source_name открытого профиля — строка подсвечивается */
  selectedId?: string | null;
  /** Карточка открытого профиля — справа от таблицы */
  detail?: ReactNode;
};

export function ProfilesList({ selectedId, detail }: Props) {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useNormalizationProfiles();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL);

  const profiles = data?.items ?? [];
  const typeOptions = [...new Set(profiles.map((profile) => profile.source_type))].sort();
  const query = search.trim().toLowerCase();
  const filtered = profiles
    .filter((profile) => matchesSearch(profile, query))
    .filter((profile) => !typeFilter || profile.source_type === typeFilter);

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Профили нормализации</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Правила преобразования событий из разных источников в единую модель SOC Engine.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={routes.normalizationFields}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
          >
            <Layers className="size-4" />
            Поля нормализации
          </Link>
          <Link
            href={routes.normalizationProfileNew}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-light px-4 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            <Plus className="size-4" />
            Создать профиль
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative block min-w-[200px] flex-1">
              <Search
                aria-hidden
                className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по названию или описанию"
                aria-label="Поиск профилей"
                className="h-11 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
            </label>
            <div className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white pr-9 pl-3.5 text-sm text-ink focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20">
              <span className="text-ink-muted">Тип источника:</span>
              <span className={cn(typeFilter && "font-medium")}>
                {typeFilter ? getProfileTypeLabel(typeFilter) : "Все"}
              </span>
              <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-4 text-ink-muted" />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Фильтр: тип источника"
                className="absolute inset-0 cursor-pointer appearance-none opacity-0"
              >
                <option value={ALL}>Все</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {getProfileTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-base font-semibold text-ink">
            Профили{data ? ` (${filtered.length})` : ""}
          </h2>

          {isError ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-ink">Не удалось загрузить профили нормализации</p>
              <Button variant="outline" onClick={() => refetch()}>
                Повторить попытку
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead className="border-b border-line-muted bg-surface-muted">
                    <tr>
                      <th className={cn(headClass, "pl-4")}>Название</th>
                      <th className={headClass}>Тип</th>
                      <th className={headClass}>Формат</th>
                      <th className={headClass}>Статус</th>
                      <th className="w-10" aria-label="Действия" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-muted">
                    {isPending ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-4" colSpan={5}>
                            <div className="h-9 rounded bg-line-muted" />
                          </td>
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-14 text-center text-sm text-ink-muted">
                          <Shuffle className="mx-auto mb-2 h-8 w-8 text-line" />
                          {profiles.length ? "По заданным условиям ничего не найдено" : "Профилей пока нет"}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((profile) => {
                        const href = routes.normalizationProfile(profile.source_name);
                        const isSelected = profile.source_name === selectedId;
                        return (
                          <tr
                            key={profile.source_name}
                            aria-selected={isSelected || undefined}
                            onClick={() => router.push(href, { scroll: false })}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-brand-soft/30 shadow-[inset_3px_0_0_var(--color-brand-light)]"
                                : "hover:bg-surface-muted",
                            )}
                          >
                            <td className="max-w-[260px] py-3 pr-3 pl-4">
                              <Link
                                href={href}
                                scroll={false}
                                aria-current={isSelected ? "page" : undefined}
                                onClick={(event) => event.stopPropagation()}
                                className="text-sm font-semibold break-words text-ink hover:text-[#1067c2]"
                              >
                                {profile.source_name}
                              </Link>
                              {profile.description && (
                                <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{profile.description}</p>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <ProfileTypeTag>{getProfileTypeLabel(profile.source_type)}</ProfileTypeTag>
                            </td>
                            <td className="px-3 py-3">
                              <ProfileFormatTag>{formatNormalizationFormat(profile.format)}</ProfileFormatTag>
                            </td>
                            <td className="px-3 py-3">
                              <ProfileStatus enabled={profile.enabled} />
                            </td>
                            <td className="py-3 pr-3">
                              <RowMenu name={profile.source_name} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="min-w-0 xl:sticky xl:top-5">
          {detail ?? (
            <div className="hidden rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center text-sm text-ink-muted xl:block">
              Выберите профиль слева, чтобы посмотреть сопоставление полей и протестировать его
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
