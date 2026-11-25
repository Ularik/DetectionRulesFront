"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ExternalLink, Info, Plus, Search, Sparkles, X } from "lucide-react";
import {
  getMitreTechniqueStatus,
  useMitreTechniques,
  type MitreTechnique,
} from "@/entities/mitre-technique";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { SearchSelect, type SearchSelectOption } from "@/shared/ui/form";

// Блок «5. MITRE ATT&CK»: необязательная классификация результата (mitre_ids → MITRE-контекст Scenario).
// Не условие корреляции: Matcher сопоставляет только sequence.

const formatTactic = (tactic: string) =>
  tactic
    .split("-")
    .map((word) => (word === "and" ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");

const STATUS_TEXT = { revoked: "отозвана", deprecated: "устарела" } as const;

export interface MitreCandidate {
  mitreId: string;
  /** Правила обнаружения цепочки, к которым привязана техника */
  ruleIds: string[];
}

function techniqueWarning(id: string, technique: MitreTechnique | undefined, loaded: boolean) {
  if (!loaded) return null;
  if (!technique) return "Техники нет в каталоге MITRE";
  const status = getMitreTechniqueStatus(technique);
  return status === "active"
    ? null
    : `Техника ${STATUS_TEXT[status]} — backend не примет её при сохранении, замените на актуальную`;
}

export function MitrePicker({
  value,
  onChange,
  candidates,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  candidates: MitreCandidate[];
}) {
  const { data: techniques = [], isPending, isError, refetch } = useMitreTechniques();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const byId = useMemo(
    () => new Map(techniques.map((technique) => [technique.mitre_id, technique])),
    [techniques],
  );

  const options = useMemo<SearchSelectOption[]>(
    () =>
      techniques
        .filter((technique) => !value.includes(technique.mitre_id))
        .sort((a, b) => a.mitre_id.localeCompare(b.mitre_id, undefined, { numeric: true }))
        .map((technique) => {
          const status = getMitreTechniqueStatus(technique);
          const tactics = technique.tactics.map(formatTactic).join(", ");
          return {
            value: technique.mitre_id,
            label: `${technique.mitre_id} · ${technique.name}`,
            description: tactics || undefined,
            keywords: `${technique.tactics.join(" ")} ${tactics}`,
            disabled: status !== "active",
            hint: status === "active" ? (technique.is_subtechnique ? "подтехника" : undefined) : STATUS_TEXT[status],
          };
        }),
    [techniques, value],
  );

  const visibleCandidates = candidates.filter(
    (candidate) =>
      !value.includes(candidate.mitreId) &&
      !dismissed.includes(candidate.mitreId) &&
      (!byId.size || getMitreTechniqueStatus(byId.get(candidate.mitreId) ?? { revoked: false, deprecated: false }) === "active"),
  );

  const add = (id: string) => !value.includes(id) && onChange([...value, id]);

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[11px] leading-4 text-ink-muted">
        <Info aria-hidden className="mt-px size-3.5 shrink-0" />
        Это классификация результата, а не условие корреляции: Matcher не ищет события с выбранной
        техникой. При совпадении правила техники добавляются к MITRE-контексту Scenario. Тактика
        определяется техникой из каталога.
      </p>

      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map((id) => {
            const technique = byId.get(id);
            const warning = techniqueWarning(id, technique, !isPending && !isError);
            const isOpen = expanded === id;
            return (
              <li
                key={id}
                className={cn(
                  "flex flex-col rounded-xl border bg-white",
                  warning ? "border-amber-300" : "border-line",
                )}
              >
                <div className="flex items-start gap-2 px-3 py-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] break-words text-ink">
                      <span className="font-mono font-semibold">{id}</span>
                      {technique && <> · {technique.name}</>}
                    </span>
                    {technique && technique.tactics.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {technique.tactics.map((tactic) => (
                          <span key={tactic} className="rounded bg-[#eef5ff] px-1.5 text-[10px] leading-4 text-[#0b4f94]">
                            {formatTactic(tactic)}
                          </span>
                        ))}
                      </span>
                    )}
                    {warning && (
                      <span className="flex items-start gap-1 text-[11px] text-amber-700">
                        <AlertTriangle aria-hidden className="mt-px size-3.5 shrink-0" />
                        {warning}
                      </span>
                    )}
                  </div>
                  {technique && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      aria-label={`Описание ${id}`}
                      className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
                    >
                      <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((item) => item !== id))}
                    aria-label={`Убрать ${id}`}
                    className="rounded-md p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                {isOpen && technique && (
                  <div className="flex flex-col gap-2 border-t border-line-muted px-3 py-2 text-xs text-ink-muted">
                    <p className="line-clamp-6 whitespace-pre-line">{technique.description}</p>
                    <Link
                      href={routes.mitreTechnique(id)}
                      target="_blank"
                      className="inline-flex w-fit items-center gap-1 font-medium text-brand-light hover:text-brand"
                    >
                      Открыть в справочнике MITRE
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {visibleCandidates.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#d9ebfc] bg-[#f6faff] px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0b4f94]">
            <Sparkles aria-hidden className="size-4" />
            Кандидаты из правил обнаружения цепочки
          </span>
          <ul className="flex flex-col gap-1.5">
            {visibleCandidates.map((candidate) => {
              const technique = byId.get(candidate.mitreId);
              return (
                <li key={candidate.mitreId} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="min-w-0 flex-1 text-ink">
                    <span className="font-mono font-semibold">{candidate.mitreId}</span>
                    {technique && <> · {technique.name}</>}
                    <span className="ml-1 text-[11px] text-ink-muted">
                      из {candidate.ruleIds.join(", ")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => add(candidate.mitreId)}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 font-medium text-white hover:bg-brand"
                  >
                    <Plus className="size-3" />
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissed((items) => [...items, candidate.mitreId])}
                    className="rounded-md px-2 py-0.5 text-ink-muted hover:bg-white hover:text-ink"
                  >
                    Отклонить
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-ink-muted">
            Техники уже привязаны к выбранным правилам обнаружения. Подтвердите, только если они описывают
            результат цепочки: попытка атаки и подтверждённая эксплуатация — разные факты.
          </p>
        </div>
      )}

      <SearchSelect
        value=""
        onChange={add}
        options={options}
        loading={isPending}
        searchPlaceholder="ID, название техники или тактика…"
        emptyText={isError ? "Каталог MITRE недоступен" : "Техники не найдены"}
        trigger={
          <button
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 text-left text-[13px] text-ink-muted hover:border-brand-light"
          >
            <Search aria-hidden className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Найти технику: ID, название или тактика</span>
            <span className="shrink-0 text-[11px]">Необязательно</span>
          </button>
        }
      />
      {isError && (
        <p className="text-[11px] text-red-600">
          Не удалось загрузить каталог MITRE.{" "}
          <button type="button" onClick={() => refetch()} className="font-medium underline">
            Повторить
          </button>
        </p>
      )}
    </div>
  );
}
