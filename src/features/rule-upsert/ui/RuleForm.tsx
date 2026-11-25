"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { GripVertical, Play, Plus, Save, Trash2, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import {
  RULE_CONDITION_MODES,
  RULE_CONDITION_OPERATORS,
  RULE_EVENT_FIELDS,
  RULE_SEVERITIES,
  RULE_SEVERITY_DOT,
  ruleExists,
  useAllRules,
  useDetectionCategories,
  useDetectionScopes,
  type RuleConditionOperator,
  type SeverityHint,
} from "@/entities/rule";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import {
  DESCRIPTION_MAX,
  RECOMMENDATIONS_MAX,
  emptyCondition,
  formValuesToPayload,
  type RuleFormValues,
} from "../model/formValues";
import { useCreateRule } from "../model/useCreateRule";
import { useUpdateRule } from "../model/useUpdateRule";
import { ChipsInput, Field, SelectBox, Toggle, controlClass, textareaClass } from "@/shared/ui/form";
import { RuleTestPanel } from "./RuleTestPanel";

// Правая панель «Создать правило» из макета «Правила обнаружения» (public/images/detect-rules.jpeg)

export type RuleFormTab = "main" | "conditions" | "classification" | "mitre" | "test" | "history";

const TABS: { value: RuleFormTab; label: string; editOnly?: boolean }[] = [
  { value: "main", label: "Основное" },
  { value: "conditions", label: "Условия" },
  { value: "classification", label: "Классификация" },
  { value: "mitre", label: "MITRE" },
  { value: "test", label: "Тестирование" },
  { value: "history", label: "История", editOnly: true },
];

// На какой вкладке лежит поле — чтобы при ошибке валидации открыть нужную
const FIELD_TAB: Partial<Record<keyof RuleFormValues, RuleFormTab>> = {
  pattern: "conditions",
  fields: "conditions",
  conditions: "conditions",
  match_type: "conditions",
  scenario_type: "classification",
  tactics: "classification",
  explanation_template: "classification",
  false_positive_notes: "classification",
  enabled_reason: "classification",
  mitre_ids: "mitre",
};

const MITRE_ID = /^T\d{4}(\.\d{3})?$/;

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

const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

type Props = {
  mode: "create" | "edit";
  defaultValues: RuleFormValues;
  initialTab?: RuleFormTab;
  /** Под заголовком: автор, даты создания/изменения */
  meta?: ReactNode;
  /** Содержимое вкладки «История» (только для существующего правила) */
  history?: ReactNode;
  /** Дополнительные действия в футере (например, удаление) */
  actions?: ReactNode;
};

export function RuleForm({ mode, defaultValues, initialTab = "main", meta, history, actions }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const tabs = TABS.filter((item) => !item.editOnly || (isEdit && history));
  const [tab, setTab] = useState<RuleFormTab>(
    tabs.some((item) => item.value === initialTab) ? initialTab : "main",
  );

  const { data: scopes = [] } = useDetectionScopes();
  const { data: categories = [] } = useDetectionCategories();
  const { data: allRules } = useAllRules();
  const createMutation = useCreateRule();
  const updateMutation = useUpdateRule();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RuleFormValues>({ defaultValues });

  const conditionsArray = useFieldArray({ control, name: "conditions" });

  const [pattern, conditions, scope, description, recommendations] = useWatch({
    control,
    name: ["pattern", "conditions", "scope", "description", "recommendations"],
  });

  // Правила с теми же условиями — предупреждение внизу панели, как в макете
  const similarRules = useMemo(() => {
    const signature = (items: { field: string; operator: string; value: string }[]) =>
      items
        .filter((item) => item.field && item.value)
        .map((item) => `${item.field}|${item.operator}|${item.value.toLowerCase()}`)
        .sort()
        .join("&");
    const ownSignature = signature(conditions);
    const ownPattern = pattern.trim().toLowerCase();
    if (!ownSignature && !ownPattern) return [];
    return (allRules?.items ?? [])
      .filter((rule) => rule.rule_id !== defaultValues.rule_id || !isEdit)
      .filter(
        (rule) =>
          (ownPattern && rule.pattern.trim().toLowerCase() === ownPattern && rule.scope === scope) ||
          (ownSignature && signature(rule.conditions) === ownSignature),
      )
      .map((rule) => rule.rule_id);
  }, [allRules, conditions, pattern, scope, defaultValues.rule_id, isEdit]);

  const scopeOptions = withCurrent(
    scopes.map((item) => item.scope),
    defaultValues.scope,
  );
  const categoryOptions = withCurrent(
    categories.map((item) => item.category),
    defaultValues.category,
  );
  const scopeName = (value: string) => scopes.find((item) => item.scope === value)?.name ?? value;
  const categoryName = (value: string) =>
    categories.find((item) => item.category === value)?.name ?? value;

  // Выбор категории подставляет её значения по умолчанию в пустые поля
  const applyCategoryDefaults = (value: string) => {
    const category = categories.find((item) => item.category === value);
    if (!category) return;
    const current = getValues();
    if (!current.attack_type) setValue("attack_type", category.default_attack_type);
    if (!current.scenario_type) setValue("scenario_type", category.default_scenario_type);
    if (!current.mitre_ids.length) setValue("mitre_ids", category.default_mitre_ids);
    if (!current.tactics.length) setValue("tactics", category.default_tactics);
    if (!isEdit) setValue("severity_hint", category.default_severity);
  };

  // Выбор scope подставляет поля по умолчанию, если они ещё не заданы
  const applyScopeDefaults = (value: string) => {
    const item = scopes.find((entry) => entry.scope === value);
    if (item && !getValues("fields").length) setValue("fields", item.default_fields);
  };

  const close = () => router.push(routes.rules, { scroll: false });

  const save = (andTest: boolean) =>
    handleSubmit(
      async (values) => {
        const payload = formValuesToPayload(values);
        try {
          if (isEdit) {
            await updateMutation.mutateAsync({ rule_id: payload.rule_id, data: payload });
            toast.success(`Правило ${payload.rule_id} сохранено`);
            if (andTest) setTab("test");
          } else {
            // Занятый Rule ID backend отклонит (400), но проверяем заранее, чтобы показать ошибку у поля
            const taken = await ruleExists(payload.rule_id).catch(() => false);
            if (taken) {
              setTab("main");
              setError("rule_id", { message: `Правило ${payload.rule_id} уже существует` });
              return;
            }
            await createMutation.mutateAsync(payload);
            toast.success(`Правило ${payload.rule_id} создано`);
            router.replace(
              andTest ? routes.ruleTest(payload.rule_id) : routes.rule(payload.rule_id),
              { scroll: false },
            );
          }
        } catch (error) {
          toast.error(`Не удалось сохранить правило: ${apiErrorText(error)}`);
        }
      },
      (formErrors: FieldErrors<RuleFormValues>) => {
        const first = Object.keys(formErrors)[0] as keyof RuleFormValues | undefined;
        if (first) setTab(FIELD_TAB[first] ?? "main");
        toast.error("Проверьте заполнение обязательных полей");
      },
    )();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save(false);
      }}
      className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]"
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <h2 className="text-xl font-semibold break-all text-ink">
          {isEdit ? `Правило ${defaultValues.rule_id}` : "Создать правило"}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </header>
      {meta && <div className="px-5 pt-1.5">{meta}</div>}

      <nav
        role="tablist"
        aria-label="Разделы правила"
        className="mt-3 flex gap-1 overflow-x-auto border-b border-line-muted px-3"
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
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
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-muted">Статус правила</span>
            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label={field.value ? "Активно" : "Отключено"}
                />
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rule ID" required error={errors.rule_id?.message}>
              <input
                {...register("rule_id", {
                  required: required("Rule ID"),
                  validate: (value) =>
                    !/\s/.test(value.trim()) || "Rule ID не должен содержать пробелов",
                })}
                disabled={isEdit}
                placeholder="WEB-CMDI-012"
                aria-invalid={Boolean(errors.rule_id) || undefined}
                className={cn(controlClass, "font-mono")}
              />
            </Field>
            <Field label="Scope" required error={errors.scope?.message}>
              <Controller
                control={control}
                name="scope"
                rules={{ required: required("Scope") }}
                render={({ field }) => (
                  <SelectBox
                    value={field.value}
                    invalid={Boolean(errors.scope)}
                    ariaLabel="Scope"
                    onChange={(value) => {
                      field.onChange(value);
                      applyScopeDefaults(value);
                    }}
                  >
                    <option value="">Выберите scope</option>
                    {scopeOptions.map((option) => (
                      <option key={option} value={option}>
                        {scopeName(option)}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Категория" required error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                rules={{ required: required("Категория") }}
                render={({ field }) => (
                  <SelectBox
                    value={field.value}
                    invalid={Boolean(errors.category)}
                    ariaLabel="Категория"
                    onChange={(value) => {
                      field.onChange(value);
                      applyCategoryDefaults(value);
                    }}
                  >
                    <option value="">Выберите категорию</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {categoryName(option)}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Attack type" required error={errors.attack_type?.message}>
              <input
                {...register("attack_type", { required: required("Attack type") })}
                list="rule-attack-types"
                placeholder="web_exploit_attempt"
                aria-invalid={Boolean(errors.attack_type) || undefined}
                className={controlClass}
              />
              <datalist id="rule-attack-types">
                {[...new Set(categories.map((item) => item.default_attack_type))].map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </Field>
            <Field label="Severity" required>
              <Controller
                control={control}
                name="severity_hint"
                render={({ field }) => (
                  <SelectBox
                    value={field.value}
                    ariaLabel="Severity"
                    onChange={(value) => field.onChange(value as SeverityHint)}
                    prefix={
                      <span
                        className={cn("block size-2 rounded-full", RULE_SEVERITY_DOT[field.value])}
                      />
                    }
                  >
                    {RULE_SEVERITIES.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </SelectBox>
                )}
              />
            </Field>
            <Field label="Confidence" error={errors.confidence?.message}>
              <div className="relative">
                <input
                  {...register("confidence", {
                    validate: (value) =>
                      value.trim() === "" ||
                      (/^\d+$/.test(value.trim()) && Number(value) <= 100) ||
                      "Целое число от 0 до 100",
                  })}
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.confidence) || undefined}
                  className={cn(controlClass, "pr-8")}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-ink-muted">
                  %
                </span>
              </div>
            </Field>
          </div>

          <Field
            label="Описание"
            required
            counter={`${description.length} / ${DESCRIPTION_MAX}`}
            error={errors.description?.message}
          >
            <textarea
              {...register("description", {
                required: required("Описание"),
                maxLength: { value: DESCRIPTION_MAX, message: `Не больше ${DESCRIPTION_MAX} символов` },
              })}
              rows={3}
              aria-invalid={Boolean(errors.description) || undefined}
              className={textareaClass}
            />
          </Field>

          <Field
            label="Рекомендации"
            hint="Каждая рекомендация с новой строки"
            counter={`${recommendations.length} / ${RECOMMENDATIONS_MAX}`}
            error={errors.recommendations?.message}
          >
            <textarea
              {...register("recommendations", {
                maxLength: {
                  value: RECOMMENDATIONS_MAX,
                  message: `Не больше ${RECOMMENDATIONS_MAX} символов`,
                },
              })}
              rows={4}
              placeholder="Проверить и заблокировать источник запроса."
              className={textareaClass}
            />
          </Field>

          <Field label="Теги">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <ChipsInput values={field.value} onChange={field.onChange} placeholder="web, injection…" />
              )}
            />
          </Field>
        </div>

        {/* Условия */}
        <div className={cn("flex flex-col gap-4", tab !== "conditions" && "hidden")}>
          <Field
            label="Pattern"
            required={!conditions.length}
            hint="Ищется в полях из списка Fields. Обязателен, если нет условий"
            error={errors.pattern?.message}
          >
            <input
              {...register("pattern", {
                validate: (value) =>
                  Boolean(value.trim()) ||
                  getValues("conditions").length > 0 ||
                  "Укажите pattern или добавьте хотя бы одно условие",
              })}
              placeholder="; cat /etc/passwd"
              aria-invalid={Boolean(errors.pattern) || undefined}
              className={cn(controlClass, "font-mono")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Field
              label="Fields"
              required={Boolean(pattern.trim())}
              hint="Поля события, в которых ищется pattern"
              error={errors.fields?.message}
            >
              <Controller
                control={control}
                name="fields"
                rules={{
                  validate: (value) =>
                    !getValues("pattern").trim() || value.length > 0 || "Укажите хотя бы одно поле",
                }}
                render={({ field }) => (
                  <ChipsInput
                    values={field.value}
                    onChange={field.onChange}
                    suggestions={RULE_EVENT_FIELDS}
                    invalid={Boolean(errors.fields)}
                    placeholder="payloads"
                    mono
                  />
                )}
              />
            </Field>
            <Field label="Case sensitive">
              <div className="flex h-9 items-center">
                <Controller
                  control={control}
                  name="case_sensitive"
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} label="Учитывать регистр" />
                  )}
                />
              </div>
            </Field>
          </div>

          <Field label="Match type" hint="Способ сравнения pattern (match_type)">
            <input {...register("match_type")} list="rule-match-types" className={controlClass} />
            <datalist id="rule-match-types">
              {RULE_CONDITION_OPERATORS.map((operator) => (
                <option key={operator.value} value={operator.value} />
              ))}
            </datalist>
          </Field>

          <Field label="Condition mode" required>
            <Controller
              control={control}
              name="condition_mode"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {RULE_CONDITION_MODES.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                        field.value === option.value
                          ? "border-brand-light bg-[#f2f9ff] text-ink"
                          : "border-line text-ink-muted",
                      )}
                    >
                      <input
                        type="radio"
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="accent-brand-light"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink">Условия</h3>
            {conditionsArray.fields.length === 0 && (
              <p className="text-xs text-ink-muted">Условий нет — правило проверяет только pattern.</p>
            )}
            {conditionsArray.fields.map((item, index) => {
              const conditionErrors = errors.conditions?.[index];
              return (
                <div key={item.id} className="flex items-start gap-2">
                  <GripVertical aria-hidden className="mt-2.5 size-4 shrink-0 text-ink-muted" />
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.3fr)]">
                    <input
                      {...register(`conditions.${index}.field`, { required: "Укажите поле" })}
                      list="rule-event-fields"
                      placeholder="http_method"
                      aria-label={`Поле условия ${index + 1}`}
                      aria-invalid={Boolean(conditionErrors?.field) || undefined}
                      className={cn(controlClass, "font-mono")}
                    />
                    <Controller
                      control={control}
                      name={`conditions.${index}.operator`}
                      render={({ field }) => (
                        <SelectBox
                          value={field.value}
                          ariaLabel={`Оператор условия ${index + 1}`}
                          onChange={(value) => field.onChange(value as RuleConditionOperator)}
                        >
                          {RULE_CONDITION_OPERATORS.map((operator) => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ))}
                        </SelectBox>
                      )}
                    />
                    <input
                      {...register(`conditions.${index}.value`, { required: "Укажите значение" })}
                      placeholder="POST"
                      aria-label={`Значение условия ${index + 1}`}
                      aria-invalid={Boolean(conditionErrors?.value) || undefined}
                      className={cn(controlClass, "font-mono")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => conditionsArray.remove(index)}
                    aria-label={`Удалить условие ${index + 1}`}
                    className="mt-1.5 rounded-md p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
            <datalist id="rule-event-fields">
              {RULE_EVENT_FIELDS.map((field) => (
                <option key={field} value={field} />
              ))}
            </datalist>
            {errors.conditions && (
              <p className="text-[11px] text-red-600">У каждого условия должны быть поле и значение</p>
            )}
            <button
              type="button"
              onClick={() => conditionsArray.append(emptyCondition())}
              className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-brand-light hover:text-brand"
            >
              <Plus className="size-4" />
              Добавить условие
            </button>
          </div>
        </div>

        {/* Классификация */}
        <div className={cn("flex flex-col gap-4", tab !== "classification" && "hidden")}>
          <Field label="Scenario type">
            <input
              {...register("scenario_type")}
              list="rule-scenario-types"
              placeholder="web_exploit_attempt"
              className={controlClass}
            />
            <datalist id="rule-scenario-types">
              {[...new Set(categories.map((item) => item.default_scenario_type))].map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>
          <Field label="Тактики">
            <Controller
              control={control}
              name="tactics"
              render={({ field }) => (
                <ChipsInput values={field.value} onChange={field.onChange} placeholder="initial-access" />
              )}
            />
          </Field>
          <Field label="Шаблон объяснения" hint="explanation_template">
            <textarea {...register("explanation_template")} rows={3} className={textareaClass} />
          </Field>
          <Field label="Ложные срабатывания" hint="false_positive_notes">
            <textarea {...register("false_positive_notes")} rows={3} className={textareaClass} />
          </Field>
          <Field label="Причина включения" hint="enabled_reason">
            <input {...register("enabled_reason")} className={controlClass} />
          </Field>
        </div>

        {/* MITRE */}
        <div className={cn("flex flex-col gap-4", tab !== "mitre" && "hidden")}>
          <Field label="MITRE IDs" hint="Идентификаторы техник, например T1059 или T1059.001">
            <Controller
              control={control}
              name="mitre_ids"
              render={({ field }) => (
                <ChipsInput
                  values={field.value}
                  onChange={(values) => field.onChange(values.map((value) => value.toUpperCase()))}
                  validate={(value) =>
                    MITRE_ID.test(value.toUpperCase()) ? null : "Формат: T1059 или T1059.001"
                  }
                  placeholder="T1059"
                  mono
                />
              )}
            />
          </Field>
          <Controller
            control={control}
            name="mitre_ids"
            render={({ field }) =>
              field.value.length ? (
                <ul className="flex flex-wrap gap-2 text-[13px]">
                  {field.value.map((id) => (
                    <li key={id}>
                      <Link
                        href={routes.mitreTechnique(id)}
                        className="text-brand-light hover:underline"
                      >
                        {id} — открыть в MITRE ATT&CK
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <></>
              )
            }
          />
        </div>

        {/* Тестирование: монтируется при открытии вкладки, чтобы пример события брал актуальные условия */}
        {tab === "test" && <RuleTestPanel getRule={() => formValuesToPayload(getValues())} />}

        {tab === "history" && history}

        {similarRules.length > 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <TriangleAlert className="mt-px size-4 shrink-0 text-amber-500" />
            <span>
              Обнаружены правила с аналогичными условиями:{" "}
              {similarRules.map((ruleId, index) => (
                <span key={ruleId}>
                  {index > 0 && ", "}
                  <Link href={routes.rule(ruleId)} scroll={false} className="font-medium text-brand-light hover:underline">
                    {ruleId}
                  </Link>
                </span>
              ))}
            </span>
          </p>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line-muted px-5 py-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-light px-4 text-sm font-semibold text-white hover:bg-brand disabled:opacity-60"
        >
          <Save className="size-4" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => save(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-surface-muted disabled:opacity-60"
        >
          <Play className="size-4" />
          Сохранить и протестировать
        </button>
        {actions}
        <button
          type="button"
          onClick={close}
          className="ml-auto inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-sm text-ink hover:bg-surface-muted"
        >
          Отмена
        </button>
      </footer>
    </form>
  );
}
