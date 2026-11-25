"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import { useSuppressionRule, type SuppressionRuleType } from "@/entities/suppression-rule";
import {
  SuppressionRuleForm,
  suppressionRuleFormDefaults,
  suppressionRuleToCopyValues,
  suppressionRuleToFormValues,
  type SuppressionRuleFormTab,
} from "@/features/suppression-rule/upsert";
import { DeleteSuppressionRulesDialog } from "@/features/suppression-rule/delete";

// Правая панель раздела «Правила подавления» (макет public/images/suppression-rules.jpeg)

function PanelMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <Link
        href={routes.suppressionRules}
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

function RuleMeta({ rule }: { rule: SuppressionRuleType }) {
  const created = formatDate(rule.created_at);
  const updated = formatDate(rule.updated_at);
  // Даты backend пока не заполняет — тогда показываем только авторов
  const parts = [
    (created || rule.created_by) &&
      `Создано${created ? ` ${created}` : ""}${rule.created_by ? ` · ${rule.created_by}` : ""}`,
    (updated || rule.updated_by) &&
      `Изменено${updated ? ` ${updated}` : ""}${rule.updated_by ? ` · ${rule.updated_by}` : ""}`,
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-0.5 text-xs text-ink-muted">
      <span className="font-mono text-ink">{rule.suppression_id}</span>
      {parts.length > 0 && <span>{parts.join("  ·  ")}</span>}
    </div>
  );
}

function DeleteRuleAction({ suppressionId }: { suppressionId: string }) {
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
      <DeleteSuppressionRulesDialog
        ruleIds={[suppressionId]}
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => router.push(routes.suppressionRules, { scroll: false })}
      />
    </>
  );
}

export function SuppressionRuleDetails({
  suppressionId,
  initialTab,
}: {
  suppressionId: string;
  initialTab?: SuppressionRuleFormTab;
}) {
  const { data: rule, isPending, error, refetch } = useSuppressionRule(suppressionId);

  if (isPending) return <PanelSkeleton />;
  if (error || !rule) {
    return isNotFound(error) || !rule ? (
      <PanelMessage title={`Правило ${suppressionId} не найдено`} />
    ) : (
      <PanelMessage title="Не удалось загрузить правило подавления">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </PanelMessage>
    );
  }

  return (
    <SuppressionRuleForm
      key={`${rule.suppression_id}:${initialTab ?? "main"}`}
      mode="edit"
      suppressionId={rule.suppression_id}
      defaultValues={suppressionRuleToFormValues(rule)}
      initialTab={initialTab}
      meta={<RuleMeta rule={rule} />}
      actions={<DeleteRuleAction suppressionId={rule.suppression_id} />}
    />
  );
}

/** Создание правила; copyFrom — «Копировать»: форма открывается с копией правила */
export function SuppressionRuleCreate({ copyFrom }: { copyFrom?: string }) {
  const { data: source, isPending, error } = useSuppressionRule(copyFrom ?? "");

  if (!copyFrom) {
    return <SuppressionRuleForm key="new" mode="create" defaultValues={suppressionRuleFormDefaults} />;
  }
  if (isPending) return <PanelSkeleton />;
  if (error || !source) {
    return <PanelMessage title={`Не удалось загрузить правило ${copyFrom} для копирования`} />;
  }

  return (
    <SuppressionRuleForm
      key={`copy:${copyFrom}`}
      mode="create"
      defaultValues={suppressionRuleToCopyValues(source)}
      meta={<span className="text-xs text-ink-muted">Копия правила {copyFrom}</span>}
    />
  );
}
