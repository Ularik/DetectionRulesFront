"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  FileText,
  Fingerprint,
  Layers,
  PenLine,
  Shield,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CopyButton } from "@/shared/ui/copy-button";
import {
  EngineActionBadge,
  describeEngineAudit,
  diffEngineAudit,
  getEngineActionLabel,
  getEngineResourceLabel,
  resolveEngineAction,
  type EngineAuditType,
} from "@/entities/audit";
import { formatAuditTimestamp } from "../lib/format";
import { getResourceHistoryHref, getResourceHref } from "../lib/resource";

export type PanelTab = "event" | "changes";

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-start gap-3 py-2.5">
      <dt className="flex items-center gap-2.5 text-[13px] text-ink-muted">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="min-w-0 text-[13px] break-words text-ink">{children}</dd>
    </div>
  );
}

function Snapshot({ value }: { value: unknown }) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <pre className="max-h-48 overflow-auto font-mono text-xs leading-5 break-all whitespace-pre-wrap">
      {value === undefined || value === null || value === "" ? "—" : text}
    </pre>
  );
}

function Changes({ audit }: { audit: EngineAuditType }) {
  const [showAll, setShowAll] = useState(false);
  const changes = diffEngineAudit(audit);

  if (!audit.before && !audit.after) {
    return <p className="py-6 text-center text-sm text-ink-muted">Снимков объекта в записи нет</p>;
  }

  const allFields = showAll
    ? [...new Set([...Object.keys(audit.before ?? {}), ...Object.keys(audit.after ?? {})])]
    : changes.map((change) => change.field);
  const changed = new Set(changes.map((change) => change.field));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span>
          {!audit.before
            ? "Объект создан — предыдущего состояния нет"
            : !audit.after
              ? "Объект удалён — состояния после нет"
              : `Изменено полей: ${changes.length}`}
        </span>
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(event) => setShowAll(event.target.checked)}
            className="size-3.5 accent-brand-light"
          />
          Все поля
        </label>
      </div>

      {allFields.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">Поля объекта не изменились</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {allFields.map((field) => {
            const before = audit.before?.[field];
            const after = audit.after?.[field];
            const isChanged = changed.has(field);
            return (
              <li
                key={field}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-2.5",
                  isChanged ? "border-line" : "border-line-muted opacity-70",
                )}
              >
                <code className="font-mono text-xs font-semibold text-ink">{field}</code>
                {isChanged ? (
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="min-w-0 rounded-md bg-red-50 px-2 py-1.5 text-red-800">
                      <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-red-600 uppercase">До</p>
                      <Snapshot value={before} />
                    </div>
                    <div className="min-w-0 rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-800">
                      <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase">После</p>
                      <Snapshot value={after} />
                    </div>
                  </div>
                ) : (
                  <div className="text-ink-muted">
                    <Snapshot value={after ?? before} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AuditEventPanel({
  audit,
  tab,
  onTabChange,
  organizationName,
  onClose,
}: {
  audit: EngineAuditType;
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  organizationName: (id: string | null) => string;
  onClose: () => void;
}) {
  const kind = resolveEngineAction(audit);
  const resourceHref = getResourceHref(audit.resource_type, audit.resource_id);
  const historyHref = getResourceHistoryHref(audit.resource_type, audit.resource_id);
  const description = describeEngineAudit(audit);
  const changesCount = diffEngineAudit(audit).length;
  const metadata = Object.keys(audit.metadata ?? {}).length ? audit.metadata : null;

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
      <header className="flex flex-col gap-1 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Детали события аудита</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-2 font-mono text-sm font-semibold break-all text-ink">{audit.resource_id || audit.audit_id}</p>
        <p className="text-sm text-ink-muted">
          {getEngineActionLabel(audit)} · {getEngineResourceLabel(audit.resource_type)}
        </p>
        <p className="text-sm text-ink-muted">
          {formatAuditTimestamp(audit.timestamp)} · {audit.actor ?? "система"}
          {audit.role ? ` · ${audit.role}` : ""}
        </p>
      </header>

      <div className="mt-4 grid grid-cols-2 border-b border-line-muted" role="tablist">
        {(
          [
            ["event", "Событие"],
            ["changes", `Изменения (до / после)${changesCount ? ` · ${changesCount}` : ""}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => onTabChange(value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === value ? "border-brand-light text-brand-light" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4">
        {tab === "event" ? (
          <div className="flex flex-col gap-4">
            <dl className="divide-y divide-line-muted rounded-xl border border-line px-4">
              <InfoRow icon={PenLine} label="Действие">
                <EngineActionBadge kind={kind} label={getEngineActionLabel(audit)} />
              </InfoRow>
              <InfoRow icon={Layers} label="Тип объекта">
                {getEngineResourceLabel(audit.resource_type)}
              </InfoRow>
              <InfoRow icon={Fingerprint} label="Объект (ID)">
                {audit.resource_id ? (
                  resourceHref ? (
                    <Link href={resourceHref} className="inline-flex items-center gap-1 font-medium text-[#1067c2] hover:underline">
                      <span className="break-all">{audit.resource_id}</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </Link>
                  ) : (
                    <span className="font-mono break-all">{audit.resource_id}</span>
                  )
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={User} label="Пользователь">
                {audit.actor ?? "—"}
              </InfoRow>
              <InfoRow icon={Shield} label="Роль">
                {audit.role ? (
                  <span className="rounded-md bg-[#eef2f7] px-2 py-0.5 text-xs font-medium text-ink-muted">{audit.role}</span>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={Building2} label="Организация">
                {audit.organization_id ? organizationName(audit.organization_id) : "—"}
              </InfoRow>
              <InfoRow icon={FileText} label="Описание">
                {description}
              </InfoRow>
            </dl>

            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
              <span className="min-w-0 truncate">
                ID записи: <span className="font-mono">{audit.audit_id}</span>
              </span>
              <CopyButton value={audit.audit_id} label="Скопировать ID записи" successMessage="ID записи скопирован" />
            </div>

            {metadata && (
              <details className="rounded-xl border border-line px-4 py-3">
                <summary className="cursor-pointer text-[13px] font-medium text-ink">Дополнительные данные</summary>
                <pre className="mt-2 max-h-60 overflow-auto font-mono text-xs break-all whitespace-pre-wrap text-ink-muted">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <Changes audit={audit} />
        )}
      </div>

      {(historyHref || resourceHref) && (
        <footer className="mt-auto border-t border-line-muted px-5 py-4">
          <Link
            href={historyHref ?? resourceHref ?? "#"}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
          >
            <ExternalLink className="size-4" />
            {historyHref ? "Открыть в истории правила" : "Открыть объект"}
          </Link>
        </footer>
      )}
    </section>
  );
}

