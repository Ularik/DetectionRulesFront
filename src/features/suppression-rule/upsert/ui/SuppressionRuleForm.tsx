"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  ExclusionTypeLabel,
  SUPPRESSION_ACTIONS,
  SUPPRESSION_DECISIONS,
  SUPPRESSION_SEVERITIES,
  getExclusionType,
  hasMatchConditions,
  useSuppressionMatchFields,
  type SuppressionMatchSchema,
} from "@/entities/suppression-rule";
import { useAttackTypes } from "@/entities/attack-type";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { ChipsInput, Field, SelectBox, Toggle, controlClass, textareaClass } from "@/shared/ui/form";
import {
  DESCRIPTION_MAX,
  REASON_MAX,
  formValuesToCreatePayload,
  formValuesToMatch,
  formValuesToUpdatePayload,
  type SuppressionRuleFormValues,
} from "../model/formValues";
import { useCreateSuppressionRule, useUpdateSuppressionRule } from "../model/mutations";
import { SuppressionRuleTestPanel } from "./SuppressionRuleTestPanel";

// Правая панель «Новое правило подавления» из макета public/images/suppression-rules.jpeg

export type SuppressionRuleFormTab = "main" | "conditions" | "action" | "test";

const TABS: { value: SuppressionRuleFormTab; label: string }[] = [
  { value: "main", label: "Основное" },
  { value: "conditions", label: "Условия" },
  { value: "action", label: "Действие" },
  { value: "test", label: "Тестирование" },
];

const MATCH_FORM_FIELDS = [
  "source_ip",
  "destination_ip",
  "dst_port",
  "observer_host",
  "attack_type",
  "detection_rule_id",
  "category",
  "paths",
  "path_prefixes",
  "contains",
] as const satisfies readonly (keyof SuppressionRuleFormValues & keyof SuppressionMatchSchema)[];

// На какой вкладке поле — при ошибке валидации открывается нужная
const FIELD_TAB: Partial<Record<keyof SuppressionRuleFormValues, SuppressionRuleFormTab>> = {
  ...Object.fromEntries(MATCH_FORM_FIELDS.map((field) => [field, "conditions"])),
  risk_score: "action",
  suppression_reason: "action",
};

const required = (label: string) => `Заполните поле «${label}»`;

function apiErrorText(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: { loc?: unknown[]; msg?: string }) => `${item.loc?.slice(1).join(".")}: ${item.msg}`)
        .join("; ");
    }
    if (error.response?.status) return `Ошибка сервера (${error.response.status})`;
  }
  return "Нет связи с сервером";
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const validateIp = (value: string) => {
  const ip = value.trim();
  if (!ip) return true;
  return IPV4.test(ip) || (ip.includes(":") && /^[0-9a-fA-F:.]+$/.test(ip)) || "IP-адрес без маски, например 10.10.10.10";
};

const intInRange = (min: number, max: number) => (value: string) => {
  const text = value.trim();
  if (!text) return true;
  return (/^\d+$/.test(text) && Number(text) >= min && Number(text) <= max) || `Целое число от ${min} до ${max}`;
};

type Props = {
  mode: "create" | "edit";
  /** suppression_id редактируемого правила */
  suppressionId?: string;
  defaultValues: SuppressionRuleFormValues;
  initialTab?: SuppressionRuleFormTab;
  /** Под заголовком: id, автор, даты */
  meta?: ReactNode;
  /** Дополнительные действия в футере (например, удаление) */
  actions?: ReactNode;
};

export function SuppressionRuleForm({
  mode,
  suppressionId,
  defaultValues,
  initialTab = "main",
  meta,
  actions,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [tab, setTab] = useState<SuppressionRuleFormTab>(initialTab);
  const [matchError, setMatchError] = useState<string | null>(null);

  const { data: matchFields } = useSuppressionMatchFields();
  const { data: attackTypes } = useAttackTypes();
  const attackTypeOptions = attackTypes?.items ?? [];
  const createMutation = useCreateSuppressionRule();
  const updateMutation = useUpdateSuppressionRule();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SuppressionRuleFormValues>({ defaultValues });

  const values = useWatch({ control });
  const reasonLength = values.reason?.length ?? 0;
  const exclusionType = getExclusionType(formValuesToMatch({ ...defaultValues, ...values } as SuppressionRuleFormValues));

  const hint = (field: keyof SuppressionMatchSchema) =>
    matchFields?.items.find((item) => item.field === field)?.description;

  const close = () => router.push(routes.suppressionRules, { scroll: false });

  const save = handleSubmit(
    async (formValues) => {
      if (!hasMatchConditions(formValuesToMatch(formValues))) {
        setMatchError("Заполните хотя бы одно условие");
        setTab("conditions");
        toast.error("Правилу нужно хотя бы одно условие");
        return;
      }
      setMatchError(null);
      try {
        if (isEdit && suppressionId) {
          await updateMutation.mutateAsync({
            suppression_id: suppressionId,
            data: formValuesToUpdatePayload(formValues),
            enabled: formValues.enabled,
          });
          toast.success(`Правило ${suppressionId} сохранено`);
        } else {
          const created = await createMutation.mutateAsync(formValuesToCreatePayload(formValues));
          toast.success(`Правило ${created.suppression_id} создано`);
          router.replace(routes.suppressionRule(created.suppression_id), { scroll: false });
        }
      } catch (error) {
        toast.error(`Не удалось сохранить правило: ${apiErrorText(error)}`);
      }
    },
    (formErrors: FieldErrors<SuppressionRuleFormValues>) => {
      const first = Object.keys(formErrors)[0] as keyof SuppressionRuleFormValues | undefined;
      if (first) setTab(FIELD_TAB[first] ?? "main");
      toast.error("Проверьте заполнение полей");
    },
  );

  const chips = (
    name: "paths" | "path_prefixes" | "contains" | "tags",
    placeholder: string,
    mono = true,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ChipsInput
          values={field.value}
          onChange={(next) => {
            field.onChange(next);
            setMatchError(null);
          }}
          placeholder={placeholder}
          mono={mono}
        />
      )}
    />
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]"
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-ink">
            {isEdit ? "Редактирование правила подавления" : "Новое правило подавления"}
          </h2>
          {meta && <div className="mt-1">{meta}</div>}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </header>

      <nav
        role="tablist"
        aria-label="Разделы правила подавления"
        className="mt-3 flex gap-1 border-b border-line-muted px-3"
      >
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "-mb-px min-w-0 flex-1 truncate border-b-2 px-2 py-2.5 text-[13px] font-medium transition-colors",
              tab === item.value
                ? "border-brand-light text-brand-light"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 px-5 py-5">
        {/* Основное */}
        <div className={cn("flex flex-col gap-4", tab !== "main" && "hidden")}>
          <Field label="Название" required error={errors.description?.message}>
            <input
              {...register("description", {
                validate: (value) => Boolean(value.trim()) || required("Название"),
                maxLength: { value: DESCRIPTION_MAX, message: `Не больше ${DESCRIPTION_MAX} символов` },
              })}
              placeholder="Исключение для доверенного сканера"
              aria-invalid={Boolean(errors.description) || undefined}
              className={controlClass}
            />
          </Field>

          <Field label="Тип исключения" hint="Определяется по заполненным условиям на вкладке «Условия»">
            <button
              type="button"
              onClick={() => setTab("conditions")}
              className={cn(controlClass, "flex items-center text-left hover:bg-surface-muted")}
            >
              <ExclusionTypeLabel type={exclusionType} />
            </button>
          </Field>

          <Field
            label="Описание / Причина"
            counter={`${reasonLength} / ${REASON_MAX}`}
            error={errors.reason?.message}
          >
            <textarea
              {...register("reason", {
                maxLength: { value: REASON_MAX, message: `Не больше ${REASON_MAX} символов` },
              })}
              rows={4}
              placeholder="Подавление событий от доверенного сканера уязвимостей, используемого для регулярного аудита"
              aria-invalid={Boolean(errors.reason) || undefined}
              className={textareaClass}
            />
          </Field>

          <Field label="Теги">{chips("tags", "scanner, trusted…", false)}</Field>

          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} label="Включить правило" />
            )}
          />
        </div>

        {/* Условия */}
        <div className={cn("flex flex-col gap-4", tab !== "conditions" && "hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[13px] text-ink">
            <ExclusionTypeLabel type={exclusionType} />
            <span className="text-xs text-ink-muted">Срабатывает, когда совпадают все заданные условия</span>
          </div>
          {matchError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{matchError}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Source IP" hint={hint("source_ip")} error={errors.source_ip?.message}>
              <input
                {...register("source_ip", { validate: validateIp, onChange: () => setMatchError(null) })}
                placeholder="10.10.20.10"
                aria-invalid={Boolean(errors.source_ip) || undefined}
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Destination IP" hint={hint("destination_ip")} error={errors.destination_ip?.message}>
              <input
                {...register("destination_ip", { validate: validateIp, onChange: () => setMatchError(null) })}
                placeholder="192.168.100.20"
                aria-invalid={Boolean(errors.destination_ip) || undefined}
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Attack type" hint={hint("attack_type")}>
              <Controller
                control={control}
                name="attack_type"
                render={({ field }) => (
                  <SelectBox
                    value={field.value}
                    ariaLabel="Attack type"
                    onChange={(value) => {
                      field.onChange(value);
                      setMatchError(null);
                    }}
                  >
                    <option value="">Любой</option>
                    {field.value && !attackTypeOptions.some((item) => item.value === field.value) && (
                      <option value={field.value}>{field.value}</option>
                    )}
                    {attackTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Category" hint={hint("category")}>
              <input
                {...register("category", { onChange: () => setMatchError(null) })}
                placeholder="web_attack"
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Destination port" hint={hint("dst_port")} error={errors.dst_port?.message}>
              <input
                {...register("dst_port", { validate: intInRange(1, 65535), onChange: () => setMatchError(null) })}
                inputMode="numeric"
                placeholder="443"
                aria-invalid={Boolean(errors.dst_port) || undefined}
                className={controlClass}
              />
            </Field>
            <Field label="Observer host" hint={hint("observer_host")}>
              <input
                {...register("observer_host", { onChange: () => setMatchError(null) })}
                placeholder="wazuh"
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Detection rule ID" hint={hint("detection_rule_id")} className="sm:col-span-2">
              <input
                {...register("detection_rule_id", { onChange: () => setMatchError(null) })}
                placeholder="5710"
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Пути" hint={hint("paths")}>
              {chips("paths", "/usr/bin/nmap")}
            </Field>
            <Field label="Path prefixes" hint={hint("path_prefixes")}>
              {chips("path_prefixes", "/scan/")}
            </Field>
            <Field label="Contains" hint={hint("contains")} className="sm:col-span-2">
              {chips("contains", "nmap, nikto, masscan…")}
            </Field>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Plus className="size-3.5" />
            Значения в списках добавляются по Enter или запятой
          </p>
        </div>

        {/* Действие */}
        <div className={cn("flex flex-col gap-4", tab !== "action" && "hidden")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Действие" hint="Итоговое действие инцидента">
              <Controller
                control={control}
                name="action"
                render={({ field }) => (
                  <SelectBox value={field.value} ariaLabel="Действие" onChange={field.onChange}>
                    <option value="">Не менять</option>
                    {SUPPRESSION_ACTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field
              label="Severity"
              hint={isEdit ? "Через редактирование не меняется — задаётся при создании правила" : "Итоговая критичность инцидента"}
            >
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <SelectBox value={field.value} ariaLabel="Severity" disabled={isEdit} onChange={field.onChange}>
                    <option value="">Не менять</option>
                    {SUPPRESSION_SEVERITIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Decision" hint="Итоговое решение по инциденту">
              <Controller
                control={control}
                name="decision"
                render={({ field }) => (
                  <SelectBox value={field.value} ariaLabel="Decision" onChange={field.onChange}>
                    <option value="">Не менять</option>
                    {SUPPRESSION_DECISIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Risk score" hint="Итоговый risk score (0–100); пусто — не менять" error={errors.risk_score?.message}>
              <input
                {...register("risk_score", { validate: intInRange(0, 100) })}
                inputMode="numeric"
                placeholder="10"
                aria-invalid={Boolean(errors.risk_score) || undefined}
                className={controlClass}
              />
            </Field>
            <Field
              label="Новый тип атаки"
              hint={isEdit ? "Через редактирование не меняется — задаётся при создании правила" : "Переопределение attack_type инцидента"}
              className="sm:col-span-2"
            >
              <Controller
                control={control}
                name="override_attack_type"
                render={({ field }) => (
                  <SelectBox
                    value={field.value}
                    ariaLabel="Новый тип атаки"
                    disabled={isEdit}
                    onChange={field.onChange}
                  >
                    <option value="">Не менять</option>
                    {field.value && !attackTypeOptions.some((item) => item.value === field.value) && (
                      <option value={field.value}>{field.value}</option>
                    )}
                    {attackTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
          </div>
          <Field label="Причина подавления" error={errors.suppression_reason?.message}>
            <input
              {...register("suppression_reason", {
                maxLength: { value: REASON_MAX, message: `Не больше ${REASON_MAX} символов` },
              })}
              placeholder="Доверенный инструмент"
              className={controlClass}
            />
          </Field>
          <Controller
            control={control}
            name="suppressed"
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} label="Подавить инцидент (suppressed)" />
            )}
          />
        </div>

        {/* Тестирование монтируется при открытии вкладки, чтобы пример брал актуальные значения формы */}
        {tab === "test" && (
          <SuppressionRuleTestPanel getRule={() => formValuesToCreatePayload(getValues())} />
        )}
      </div>

      <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-muted px-5 py-4">
        {actions}
        <button
          type="button"
          onClick={close}
          className="ml-auto inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-sm text-ink hover:bg-surface-muted"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-light px-4 text-sm font-semibold text-white hover:bg-brand disabled:opacity-60"
        >
          {isEdit && <Save className="size-4" />}
          {isSaving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
        </button>
      </footer>
    </form>
  );
}
