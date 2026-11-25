"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { routes } from "@/shared/config";
import { useRule, type RuleType } from "@/entities/rule";
import { AuditTimeline, useRuleAudits } from "@/entities/audit";
import { DeleteRulesDialog } from "@/features/rule-delete";
import {
  RuleForm,
  ruleFormDefaults,
  ruleToCopyValues,
  ruleToFormValues,
  type RuleFormTab,
} from "@/features/rule-upsert";

// Правая панель раздела «Правила обнаружения»: форма правила по макету public/images/detect-rules.jpeg

function PanelMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <Link
        href={routes.rules}
        scroll={false}
        aria-label="Закрыть"
        className="absolute top-4 right-4 rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
      >
        <X className="size-5" />
      </Link>
      <p className="font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      <div className="h-6 w-48 rounded bg-line-muted" />
      <div className="h-8 w-full rounded bg-line-muted" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-9 w-full rounded bg-line-muted" />
      ))}
    </div>
  );
}

const isNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404;

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

function RuleMeta({ rule }: { rule: RuleType }) {
  const created = formatDate(rule.created_at);
  const updated = formatDate(rule.updated_at);
  const parts = [
    created && `Создано ${created}${rule.created_by ? ` · ${rule.created_by}` : ""}`,
    updated && `Изменено ${updated}${rule.updated_by ? ` · ${rule.updated_by}` : ""}`,
  ].filter(Boolean);
  if (!parts.length) return null;
  return <p className="text-xs text-ink-muted">{parts.join("  ·  ")}</p>;
}

// GET /audits/rule/{id} принимает limit строго меньше 20
const HISTORY_PAGE_SIZE = 10;

function RuleHistory({ ruleId }: { ruleId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, error, refetch } = useRuleAudits(ruleId, {
    limit: HISTORY_PAGE_SIZE,
    offset: (page - 1) * HISTORY_PAGE_SIZE,
  });

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

  const total = data?.total ?? 0;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-muted">
        Журнал изменений правила. Запись открывает состояние правила на момент изменения.
      </p>
      <AuditTimeline
        items={data?.items ?? []}
        isLoading={isPending}
        getHref={(item) => routes.auditEntry(String(item.id))}
      />
      {total > HISTORY_PAGE_SIZE && (
        <PaginationControl
          page={page}
          limit={HISTORY_PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          isLoading={isFetching}
          itemsLabel="записей"
        />
      )}
    </div>
  );
}

function DeleteRuleAction({ ruleId }: { ruleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="size-4" />
        Удалить
      </button>
      <DeleteRulesDialog
        ruleIds={[ruleId]}
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => router.push(routes.rules, { scroll: false })}
      />
    </>
  );
}

export function RuleDetails({ ruleId, initialTab }: { ruleId: string; initialTab?: RuleFormTab }) {
  const { data: rule, isPending, error, refetch } = useRule(ruleId);

  if (isPending) return <PanelSkeleton />;
  if (error || !rule) {
    return isNotFound(error) || !rule ? (
      <PanelMessage title={`Правило ${ruleId} не найдено`} />
    ) : (
      <PanelMessage title="Не удалось загрузить правило">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </PanelMessage>
    );
  }

  return (
    <RuleForm
      key={`${rule.rule_id}:${initialTab ?? "main"}`}
      mode="edit"
      defaultValues={ruleToFormValues(rule)}
      initialTab={initialTab}
      meta={<RuleMeta rule={rule} />}
      history={<RuleHistory ruleId={rule.rule_id} />}
      actions={<DeleteRuleAction ruleId={rule.rule_id} />}
    />
  );
}

/** Создание правила; copyFrom — «Копировать»: форма открывается с копией правила */
export function RuleCreate({ copyFrom }: { copyFrom?: string }) {
  const { data: source, isPending, error } = useRule(copyFrom ?? "");

  if (!copyFrom) return <RuleForm key="new" mode="create" defaultValues={ruleFormDefaults} />;
  if (isPending) return <PanelSkeleton />;
  if (error || !source) return <PanelMessage title={`Не удалось загрузить правило ${copyFrom} для копирования`} />;

  return <RuleForm key={`copy:${copyFrom}`} mode="create" defaultValues={ruleToCopyValues(source)} />;
}
