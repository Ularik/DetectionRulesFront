"use client";

import { useState } from "react";
import Link from "next/link";
import { Code2, Copy, FlaskConical, Layers, SquarePen, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CopyButton } from "@/shared/ui/copy-button";
import { JsonCode } from "@/shared/ui/json-code";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  ProfileFormatTag,
  ProfileStatusBadge,
  ProfileTypeTag,
  formatNormalizationFormat,
  getProfileTypeLabel,
  useNormalizationFields,
  useNormalizationProfile,
  type NormalizationProfileType,
} from "@/entities/normalization-profile";
import { DeleteProfileButton } from "@/features/normalization-profile/delete";
import { ProfileTestPanel } from "@/features/normalization-profile/test";

// Карточка профиля справа от таблицы — по макету «Профили нормализации»

type Tab = "mapping" | "test" | "json";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "mapping", label: "Сопоставление полей", icon: Layers },
  { id: "test", label: "Тест профиля", icon: FlaskConical },
  { id: "json", label: "JSON-просмотр", icon: Code2 },
];

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-surface-muted";

function MappingTable({ profile }: { profile: NormalizationProfileType }) {
  const { data: catalog } = useNormalizationFields();
  const labels = new Map(catalog?.items.map((field) => [field.field, field.label]));
  const entries = Object.entries(profile.field_mapping ?? {});

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Сопоставление полей (field_mapping)</h3>
        <span className="rounded-md bg-brand-soft/50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink">
          Всего: {entries.length}
        </span>
      </header>
      {entries.length ? (
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line-muted bg-surface-muted text-left text-xs font-semibold text-ink">
              <tr>
                <th className="w-[38%] px-3 py-2">Поле SOC Engine</th>
                <th className="px-3 py-2">Альтернативные поля источника</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-muted">
              {entries.map(([field, aliases]) => (
                <tr key={field}>
                  <td className="px-3 py-2 align-top">
                    <span className="font-medium break-all text-ink">{field}</span>
                    {labels.get(field) && (
                      <span className="block text-[11px] text-ink-muted">{labels.get(field)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-xs break-words text-ink">{aliases.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-3 py-8 text-center text-sm text-ink-muted">
          Сопоставление полей не задано
        </p>
      )}
    </section>
  );
}

function ProfileContent({ profile }: { profile: NormalizationProfileType }) {
  const [tab, setTab] = useState<Tab>("mapping");
  const json = JSON.stringify(profile, null, 2);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5">
      <header className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold break-all text-ink">{profile.source_name}</h2>
            <ProfileStatusBadge enabled={profile.enabled} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <ProfileTypeTag>{getProfileTypeLabel(profile.source_type)}</ProfileTypeTag>
            <span className="h-4 w-px bg-line" aria-hidden />
            <span>
              Формат: <ProfileFormatTag>{formatNormalizationFormat(profile.format)}</ProfileFormatTag>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={routes.normalizationProfileEdit(profile.source_name)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
          >
            <SquarePen className="size-4" aria-hidden />
            Редактировать
          </Link>
          <Link
            href={routes.normalizationProfileCopy(profile.source_name)}
            aria-label="Дублировать профиль"
            title="Дублировать профиль"
            className={iconButtonClass}
          >
            <Copy className="size-4" />
          </Link>
          <DeleteProfileButton name={profile.source_name} />
          <Link
            href={routes.normalizationProfiles}
            scroll={false}
            aria-label="Закрыть карточку профиля"
            title="Закрыть"
            className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-5" />
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-ink">Описание</h3>
        <p className="rounded-lg bg-surface-muted px-3 py-2.5 text-sm break-words whitespace-pre-line text-ink">
          {profile.description || "—"}
        </p>
      </section>

      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
              tab === id
                ? "border-brand-light text-brand-light"
                : "border-transparent text-ink hover:text-brand-light",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* key: результат теста и пример события сбрасываются при смене профиля */}
      {tab === "mapping" && (
        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <MappingTable profile={profile} />
          <ProfileTestPanel key={json} profile={profile} />
        </div>
      )}
      {tab === "test" && <ProfileTestPanel key={json} profile={profile} layout="wide" />}
      {tab === "json" && (
        <div className="relative">
          <JsonCode value={json} className="max-h-[600px]" />
          <CopyButton value={json} label="Копировать JSON профиля" className="absolute top-1.5 right-1.5 bg-white/80" />
        </div>
      )}
    </div>
  );
}

export function ProfileDetails({ name }: { name: string }) {
  const { data, isPending, isError, refetch } = useNormalizationProfile(name);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-line bg-white p-5" aria-busy="true">
        <div className="h-8 w-1/2 rounded bg-line-muted" />
        <div className="h-12 rounded bg-line-muted" />
        <div className="h-64 rounded bg-line-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 rounded-2xl border border-line bg-white px-4 py-16 text-center">
        <p className="font-semibold text-ink" role="alert">
          {isError ? "Не удалось загрузить профиль" : "Профиль не найден"}
        </p>
        <div className="flex justify-center gap-2">
          {isError && (
            <Button variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href={routes.normalizationProfiles}>К списку профилей</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProfileContent profile={data} />;
}
