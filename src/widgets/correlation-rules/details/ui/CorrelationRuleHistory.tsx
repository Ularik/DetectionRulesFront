"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { cn } from "@/shared/lib/utils";
import {
  AUDIT_ACTION_LABELS,
  AuditTimeline,
  useCorrelationAudit,
  useCorrelationRuleAudits,
  type CorrelationAuditAction,
  type CorrelationAuditType,
} from "@/entities/audit";
import { correlationFieldLabel, formatCorrelationFieldValue } from "@/entities/correlation-rule";

// Вкладка «История» правила корреляции: GET /audits/correlation-rules/rule/{id},
// раскрытая запись — GET /audits/correlation-rules/{audit_id} (изменённые поля)

// limit у backend строго меньше 20
const PAGE_SIZE = 10;

const ACTION_FILTERS: { value: CorrelationAuditAction | ""; label: string }[] = [
  { value: "", label: "Все" },
  { value: "created", label: AUDIT_ACTION_LABELS.created },
  { value: "updated", label: AUDIT_ACTION_LABELS.updated },
  { value: "status_changed", label: AUDIT_ACTION_LABELS.status_changed },
  { value: "deleted", label: AUDIT_ACTION_LABELS.deleted },
];

function AuditChanges({ audit }: { audit: CorrelationAuditType }) {
  const { data, isPending, error, refetch } = useCorrelationAudit(audit.id);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-2">
        <div className="h-4 w-2/3 rounded bg-line-muted" />
        <div className="h-4 w-1/2 rounded bg-line-muted" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-700">
        Не удалось загрузить изменения
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    );
  }
  if (!data.changes.length) {
    return (
      <p className="text-xs text-ink-muted">
        {audit.before_id === null ? "Первая версия правила." : "Поля правила не изменились."}
      </p>
    );
  }

  return (
    <dl className="flex flex-col gap-2.5">
      {data.changes.map((change) => (
        <div key={change.field} className="flex flex-col gap-1">
          <dt className="text-xs font-semibold text-ink">{correlationFieldLabel(change.field)}</dt>
          <dd className="flex flex-wrap items-start gap-1.5 text-xs">
            <span className="rounded bg-red-50 px-1.5 py-0.5 break-all text-red-700 line-through decoration-red-300">
              {formatCorrelationFieldValue(change.field, change.old)}
            </span>
            <ArrowRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 break-all text-emerald-700">
              {formatCorrelationFieldValue(change.field, change.new)}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CorrelationRuleHistory({ correlationId }: { correlationId: string }) {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<CorrelationAuditAction | "">("");
  const { data, isPending, isFetching, error, refetch } = useCorrelationRuleAudits(correlationId, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    ...(action ? { action } : {}),
  });

  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Фильтр по действию">
        {ACTION_FILTERS.map((item) => (
          <button
            key={item.value || "all"}
            type="button"
            aria-pressed={action === item.value}
            onClick={() => {
              setAction(item.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              action === item.value
                ? "border-brand-light bg-[#f2f9ff] font-medium text-brand-light"
                : "border-line text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-ink">Не удалось загрузить историю изменений</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <>
          <AuditTimeline
            items={data?.items ?? []}
            isLoading={isPending}
            emptyText={action ? "Записей с таким действием нет" : "Изменений пока нет"}
            renderExpanded={(audit) => <AuditChanges audit={audit} />}
          />
          {total > PAGE_SIZE && (
            <PaginationControl
              page={page}
              limit={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
              isLoading={isFetching}
              itemsLabel="записей"
            />
          )}
        </>
      )}
    </div>
  );
}
