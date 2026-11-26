"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import { useCorrelationRule, type CorrelationRuleType } from "@/entities/correlation-rule";
import {
  CorrelationRuleForm,
  correlationRuleFormDefaults,
  correlationRuleToCopyValues,
  correlationRuleToFormValues,
  type CorrelationRuleFormTab,
} from "@/features/correlation-rule/upsert";
import { DeleteCorrelationRulesDialog } from "@/features/correlation-rule/delete";
import { CorrelationRuleHistory } from "./CorrelationRuleHistory";

// Правая панель раздела «Правила корреляции» (макет public/images/correlation-rules.jpeg)

function PanelMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <Link
        href={routes.correlationRules}
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
      <div className="h-6 w-56 rounded bg-line-muted" />
      <div className="h-8 w-full rounded bg-line-muted" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-9 w-full rounded bg-line-muted" />
      ))}
    </div>
  );
}

const isNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404;

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

function RuleMeta({ rule }: { rule: CorrelationRuleType }) {
  const created = formatDate(rule.created_at);
  const updated = formatDate(rule.updated_at);
  return (
    <div className="flex flex-col gap-0.5 text-xs text-ink-muted">
      <span className="font-mono text-ink">{rule.correlation_id}</span>
      {(created || updated) && (
        <span>
          {[
            created && `Создано ${created}${rule.created_by ? ` · ${rule.created_by}` : ""}`,
            updated && `Изменено ${updated}${rule.updated_by ? ` · ${rule.updated_by}` : ""}`,
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </span>
      )}
    </div>
  );
}

function DeleteRuleAction({ correlationId }: { correlationId: string }) {
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
      <DeleteCorrelationRulesDialog
        ruleIds={[correlationId]}
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => router.push(routes.correlationRules, { scroll: false })}
      />
    </>
  );
}

export function CorrelationRuleDetails({
  correlationId,
  initialTab,
}: {
  correlationId: string;
  initialTab?: CorrelationRuleFormTab;
}) {
  const { data: rule, isPending, error, refetch } = useCorrelationRule(correlationId);

  if (isPending) return <PanelSkeleton />;
  if (error || !rule) {
    return isNotFound(error) || !rule ? (
      <PanelMessage title={`Правило ${correlationId} не найдено`} />
    ) : (
      <PanelMessage title="Не удалось загрузить правило корреляции">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </PanelMessage>
    );
  }

  return (
    <CorrelationRuleForm
      key={`${rule.correlation_id}:${initialTab ?? "rule"}`}
      mode="edit"
      correlationId={rule.correlation_id}
      defaultValues={correlationRuleToFormValues(rule)}
      initialTab={initialTab}
      meta={<RuleMeta rule={rule} />}
      history={<CorrelationRuleHistory correlationId={rule.correlation_id} />}
      actions={<DeleteRuleAction correlationId={rule.correlation_id} />}
    />
  );
}

/** Создание правила; copyFrom — «Копировать»: форма открывается с копией правила */
export function CorrelationRuleCreate({ copyFrom }: { copyFrom?: string }) {
  const { data: source, isPending, error } = useCorrelationRule(copyFrom ?? "");

  if (!copyFrom) {
    return (
      <CorrelationRuleForm
        key="new"
        mode="create"
        variant="page"
        defaultValues={correlationRuleFormDefaults}
      />
    );
  }
  if (isPending) return <PanelSkeleton />;
  if (error || !source) {
    return <PanelMessage title={`Не удалось загрузить правило ${copyFrom} для копирования`} />;
  }

  return (
    <CorrelationRuleForm
      key={`copy:${copyFrom}`}
      mode="create"
      variant="page"
      defaultValues={correlationRuleToCopyValues(source)}
      meta={<span className="text-xs text-ink-muted">Копия правила {copyFrom}</span>}
    />
  );
}
