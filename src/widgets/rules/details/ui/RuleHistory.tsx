"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  AUDIT_ACTION_LABELS,
  AuditTimeline,
  normalizeAuditAction,
  useAllRuleAudits,
  useRuleAuditVersion,
  type AuditType,
} from "@/entities/audit";
import { diffRuleVersions, formatRuleFieldValue, ruleFieldLabel } from "@/entities/rule";

// Вкладка «История» правила обнаружения — как у правил корреляции: запись раскрывается и показывает
// изменённые поля. Готового diff у backend для правил обнаружения нет: GET /audits/{id} отдаёт снимок
// правила (rule), а before_id — id предыдущей записи; сравниваем два снимка на клиенте

// Фильтра по действию у GET /audits/rule/{id} нет — грузим всю историю правила
// (useAllRuleAudits, пачками по 19) и фильтруем и листаем на клиенте
const PAGE_SIZE = 10;

const ACTIONS = ["created", "updated", "status_changed", "deleted"] as const;

function AuditChanges({ audit }: { audit: AuditType }) {
  const current = useRuleAuditVersion(audit.id);
  const hasPrevious = audit.before_id !== null && audit.before_id !== undefined && audit.before_id !== "";
  const previous = useRuleAuditVersion(hasPrevious ? audit.before_id : null);

  const openLink = (
    <Link
      href={routes.auditEntry(String(audit.id))}
      className="inline-flex items-center gap-1 text-xs font-medium text-brand-light hover:underline"
    >
      Открыть версию правила
      <ExternalLink className="size-3.5" />
    </Link>
  );

  if (current.isPending || (hasPrevious && previous.isPending)) {
    return (
      <div className="flex animate-pulse flex-col gap-2">
        <div className="h-4 w-2/3 rounded bg-line-muted" />
        <div className="h-4 w-1/2 rounded bg-line-muted" />
      </div>
    );
  }
  if (current.error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-700">
        Не удалось загрузить изменения
        <Button variant="outline" size="sm" onClick={() => current.refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  const after = current.data?.rule;
  if (!hasPrevious || !after) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-muted">Первая версия правила.</p>
        {openLink}
      </div>
    );
  }
  if (previous.error || !previous.data?.rule) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-muted">Предыдущая версия недоступна — сравнить не с чем.</p>
        {openLink}
      </div>
    );
  }

  const changes = diffRuleVersions(previous.data.rule, after);

  return (
    <div className="flex flex-col gap-3">
      {changes.length ? (
        <dl className="flex flex-col gap-2.5">
          {changes.map((change) => (
            <div key={change.field} className="flex flex-col gap-1">
              <dt className="text-xs font-semibold text-ink">{ruleFieldLabel(change.field)}</dt>
              <dd className="flex flex-wrap items-start gap-1.5 text-xs">
                <span className="rounded bg-red-50 px-1.5 py-0.5 break-all whitespace-pre-line text-red-700 line-through decoration-red-300">
                  {formatRuleFieldValue(change.field, change.old)}
                </span>
                <ArrowRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 break-all whitespace-pre-line text-emerald-700">
                  {formatRuleFieldValue(change.field, change.new)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-ink-muted">Поля правила не изменились.</p>
      )}
      {openLink}
    </div>
  );
}

export function RuleHistory({ ruleId }: { ruleId: string }) {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, isPending, error, refetch } = useAllRuleAudits(ruleId);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-ink">Не удалось загрузить историю изменений</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeAuditAction(item.action);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  // Известные действия всегда, плюс незнакомые значения, если backend пришлёт такие
  const filters = [
    ...ACTIONS,
    ...Object.keys(counts).filter((key) => !(ACTIONS as readonly string[]).includes(key)),
  ];
  const filtered = action
    ? items.filter((item) => normalizeAuditAction(item.action) === action)
    : items;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const chip = (value: string, label: string, count: number) => (
    <button
      key={value || "all"}
      type="button"
      aria-pressed={action === value}
      onClick={() => {
        setAction(value);
        setPage(1);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        action === value
          ? "border-brand-light bg-[#f2f9ff] font-medium text-brand-light"
          : "border-line text-ink-muted hover:text-ink",
      )}
    >
      {label}
      {!isPending && <span className="text-[11px] opacity-70">{count}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Фильтр по действию">
        {chip("", "Все", items.length)}
        {filters.map((value) => chip(value, AUDIT_ACTION_LABELS[value] ?? value, counts[value] ?? 0))}
      </div>
      <AuditTimeline
        items={pageItems}
        isLoading={isPending}
        emptyText={action ? "Записей с таким действием нет" : "Изменений пока нет"}
        renderExpanded={(audit) => <AuditChanges audit={audit} />}
      />
      {filtered.length > PAGE_SIZE && (
        <PaginationControl
          page={currentPage}
          limit={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          itemsLabel="записей"
        />
      )}
    </div>
  );
}
