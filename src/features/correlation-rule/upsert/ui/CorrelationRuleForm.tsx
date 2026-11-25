"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AlertTriangle, ChevronRight, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  CORRELATION_SEVERITIES,
  CORRELATION_SEVERITY_DOT,
  CORRELATION_SEVERITY_LABELS,
  WINDOW_UNITS,
  formatWindow,
  isRuleStep,
  ruleStepId,
  useScenarioTypes,
  windowToSeconds,
  type CorrelationSeverity,
  type WindowUnit,
} from "@/entities/correlation-rule";
import { getMitreTechniqueStatus, useMitreTechniques } from "@/entities/mitre-technique";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import {
  ChipsInput,
  Field,
  SearchSelect,
  SelectBox,
  Toggle,
  controlClass,
  textareaClass,
} from "@/shared/ui/form";
import {
  DESCRIPTION_MAX,
  formValuesToPayload,
  type CorrelationRuleFormValues,
} from "../model/formValues";
import { useCreateCorrelationRule, useUpdateCorrelationRule } from "../model/mutations";
import { useConditionCatalog } from "../model/useConditionCatalog";
import { ConditionsBuilder } from "./ConditionsBuilder";
import { CorrelationRuleTestPanel } from "./CorrelationRuleTestPanel";
import { GroupByField } from "./GroupByField";
import { MitrePicker, type MitreCandidate } from "./MitrePicker";

// Конструктор правила корреляции: пять последовательных блоков
// (основное → условия → параметры корреляции → результат → MITRE). Поля — CorrelationRuleRequestCreateUpdateSchema;
// correlation_id выдаёт backend, автор и даты только для просмотра.

export type CorrelationRuleFormTab = "rule" | "test" | "history";

const TABS: { value: CorrelationRuleFormTab; label: string; editOnly?: boolean }[] = [
  { value: "rule", label: "Правило" },
  { value: "test", label: "Тестирование" },
  { value: "history", label: "История", editOnly: true },
];

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

const isPositiveInt = (value: string) => /^\d+$/.test(value.trim()) && Number(value) > 0;

function Section({
  index,
  title,
  aside,
  children,
}: {
  index: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`correlation-section-${index}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 @lg:p-5"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-xs font-semibold text-[#2165aa]">
          {index}
        </span>
        <h3 id={`correlation-section-${index}`} className="min-w-0 flex-1 text-[15px] font-semibold text-ink">
          {title}
        </h3>
        {aside}
      </header>
      {children}
    </section>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-amber-700">
      <AlertTriangle aria-hidden className="mt-px size-3.5 shrink-0" />
      {children}
    </p>
  );
}

type Props = {
  mode: "create" | "edit";
  /** page — отдельная страница создания, panel — правая панель раздела */
  variant?: "page" | "panel";
  /** correlation_id редактируемого правила */
  correlationId?: string;
  defaultValues: CorrelationRuleFormValues;
  initialTab?: CorrelationRuleFormTab;
  /** Под заголовком: id, автор, даты */
  meta?: ReactNode;
  /** Содержимое вкладки «История» (только для существующего правила) */
  history?: ReactNode;
  /** Дополнительные действия в футере (например, удаление) */
  actions?: ReactNode;
};

export function CorrelationRuleForm({
  mode,
  variant = "panel",
  correlationId,
  defaultValues,
  initialTab = "rule",
  meta,
  history,
  actions,
}: Props) {
  const router = useRouter();
  const formId = useId();
  const isEdit = mode === "edit";
  const isPage = variant === "page";
  const tabs = TABS.filter((item) => !item.editOnly || (isEdit && history));
  const [tab, setTab] = useState<CorrelationRuleFormTab>(
    tabs.some((item) => item.value === initialTab) ? initialTab : "rule",
  );

  const { data: scenarioTypes = [], isPending: isScenarioTypesPending } = useScenarioTypes();
  const { data: techniques = [] } = useMitreTechniques();
  const catalog = useConditionCatalog();
  const createMutation = useCreateCorrelationRule();
  const updateMutation = useUpdateCorrelationRule();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CorrelationRuleFormValues>({ defaultValues });

  const [description, scenarioType, sequence, windowAmount, windowUnit, minCategories] = useWatch({
    control,
    name: [
      "description",
      "scenario_type",
      "sequence",
      "window_amount",
      "window_unit",
      "min_unique_categories",
    ],
  });

  // Значение старого правила, которого нет в справочнике, остаётся видимым — с предупреждением
  const scenarioSelectOptions = useMemo(
    () => [
      ...scenarioTypes,
      ...(defaultValues.scenario_type &&
      !scenarioTypes.some((item) => item.value === defaultValues.scenario_type)
        ? [{ value: defaultValues.scenario_type, label: defaultValues.scenario_type }]
        : []),
    ],
    [scenarioTypes, defaultValues.scenario_type],
  );
  const scenarioUnknown =
    Boolean(scenarioType) &&
    !isScenarioTypesPending &&
    scenarioTypes.length > 0 &&
    !scenarioTypes.some((item) => item.value === scenarioType);

  // Кандидаты MITRE — техники, уже привязанные к правилам обнаружения цепочки
  const mitreCandidates = useMemo<MitreCandidate[]>(() => {
    const map = new Map<string, string[]>();
    for (const step of sequence) {
      if (!isRuleStep(step)) continue;
      const rule = catalog.rulesById.get(ruleStepId(step));
      for (const id of rule?.mitre_ids ?? []) {
        const ruleIds = map.get(id) ?? [];
        if (!ruleIds.includes(rule!.rule_id)) map.set(id, [...ruleIds, rule!.rule_id]);
      }
    }
    return [...map.entries()].map(([mitreId, ruleIds]) => ({ mitreId, ruleIds }));
  }, [sequence, catalog.rulesById]);

  const windowSeconds = isPositiveInt(windowAmount)
    ? windowToSeconds(Number(windowAmount), windowUnit)
    : null;

  const close = () => router.push(routes.correlationRules, { scroll: false });

  const save = handleSubmit(
    async (values) => {
      const payload = formValuesToPayload(values);
      try {
        const saved =
          isEdit && correlationId
            ? await updateMutation.mutateAsync({ correlation_id: correlationId, data: payload })
            : await createMutation.mutateAsync(payload);
        const savedId = saved?.correlation_id ?? correlationId;
        toast.success(
          isEdit ? `Правило ${savedId} сохранено` : savedId ? `Правило ${savedId} создано` : "Правило создано",
        );
        if (!isEdit) {
          router.replace(savedId ? routes.correlationRule(savedId) : routes.correlationRules, {
            scroll: false,
          });
        }
      } catch (error) {
        toast.error(`Не удалось сохранить правило: ${apiErrorText(error)}`);
      }
    },
    () => {
      setTab("rule");
      toast.error("Проверьте заполнение обязательных полей");
      requestAnimationFrame(() =>
        document
          .getElementById(formId)
          ?.querySelector("[aria-invalid='true'], [data-invalid]")
          ?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
    },
  );

  const title = isEdit ? "Редактирование правила корреляции" : "Создание правила корреляции";

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className={cn(
        "@container flex flex-col",
        isPage
          ? "mx-auto w-full max-w-[920px] gap-5"
          : "rounded-2xl border border-line bg-surface shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]",
      )}
    >
      {isPage ? (
        <header className="flex flex-col gap-1">
          <nav aria-label="Навигация" className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
            <span>CERT-KG SIEM</span>
            <ChevronRight aria-hidden className="size-3.5" />
            <span>Администрирование</span>
            <ChevronRight aria-hidden className="size-3.5" />
            <Link href={routes.correlationRules} className="hover:text-brand-light">
              Правила корреляции
            </Link>
          </nav>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {meta}
        </header>
      ) : (
        <header className="flex items-start justify-between gap-3 rounded-t-2xl bg-white px-5 pt-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
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
      )}

      <nav
        role="tablist"
        aria-label="Разделы правила корреляции"
        className={cn("flex gap-1 border-b border-line-muted", isPage ? "" : "bg-white px-3 pt-3")}
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "-mb-px min-w-0 truncate border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
              !isPage && "flex-1",
              tab === item.value
                ? "border-brand-light text-brand-light"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={cn("flex flex-col gap-4", !isPage && "p-4")}>
        <div className={cn("flex flex-col gap-4", tab !== "rule" && "hidden")}>
          {/* 1. Основная информация */}
          <Section
            index={1}
            title="Основная информация"
            aside={
              <Controller
                control={control}
                name="enabled"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label={field.value ? "Включено" : "Выключено"}
                  />
                )}
              />
            }
          >
            <Field
              label="Тип сценария"
              required
              hint="Scenario, который формируется при совпадении правила (справочник scenario-types)"
              error={errors.scenario_type?.message}
            >
              <Controller
                control={control}
                name="scenario_type"
                rules={{ validate: (value) => Boolean(value.trim()) || required("Тип сценария") }}
                render={({ field }) => (
                  <SearchSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={scenarioSelectOptions}
                    loading={isScenarioTypesPending}
                    placeholder="Выберите тип сценария"
                    searchPlaceholder="Поиск сценария…"
                    ariaLabel="Тип сценария"
                    invalid={Boolean(errors.scenario_type)}
                  />
                )}
              />
              {scenarioUnknown && (
                <Warning>Значения «{scenarioType}» нет в справочнике типов сценариев — выберите актуальное</Warning>
              )}
            </Field>

            <Field
              label="Описание"
              required
              counter={`${description.length} / ${DESCRIPTION_MAX}`}
              error={errors.description?.message}
            >
              <textarea
                {...register("description", {
                  validate: (value) => Boolean(value.trim()) || required("Описание"),
                  maxLength: { value: DESCRIPTION_MAX, message: `Не больше ${DESCRIPTION_MAX} символов` },
                })}
                rows={3}
                placeholder="Последовательное обнаружение Path Traversal и SQL Injection с одного IP"
                aria-invalid={Boolean(errors.description) || undefined}
                className={textareaClass}
              />
            </Field>
          </Section>

          {/* 2. Условия корреляции */}
          <Section index={2} title="Условия корреляции">
            <Controller
              control={control}
              name="sequence"
              rules={{ validate: (value) => value.length > 0 || "Добавьте хотя бы одно условие" }}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <ConditionsBuilder
                    steps={field.value}
                    onChange={field.onChange}
                    catalog={catalog}
                    invalid={Boolean(errors.sequence)}
                  />
                  {errors.sequence?.message && (
                    <p className="text-[11px] text-red-600">{errors.sequence.message}</p>
                  )}
                </div>
              )}
            />
          </Section>

          {/* 3. Параметры корреляции */}
          <Section index={3} title="Параметры корреляции">
            <Field
              label="Временное окно"
              required
              hint="Максимальное время между связываемыми инцидентами; хранится в секундах"
              error={errors.window_amount?.message}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 @lg:max-w-[360px]">
                <input
                  {...register("window_amount", {
                    validate: (value) => isPositiveInt(value) || "Целое число больше 0",
                  })}
                  inputMode="numeric"
                  aria-label="Временное окно"
                  aria-invalid={Boolean(errors.window_amount) || undefined}
                  className={controlClass}
                />
                <Controller
                  control={control}
                  name="window_unit"
                  render={({ field }) => (
                    <SelectBox
                      value={field.value}
                      ariaLabel="Единица временного окна"
                      onChange={(value) => field.onChange(value as WindowUnit)}
                    >
                      {WINDOW_UNITS.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </SelectBox>
                  )}
                />
              </div>
              {windowSeconds !== null && (
                <p className="text-[11px] text-ink-muted">
                  window_seconds = <span className="font-mono text-ink">{windowSeconds}</span> (
                  {formatWindow(windowSeconds)})
                </p>
              )}
            </Field>

            <Field
              label="Группировка"
              required
              hint="Какие инциденты разрешено связывать между собой"
              error={errors.group_by?.message}
            >
              <Controller
                control={control}
                name="group_by"
                rules={{ validate: (value) => value.length > 0 || "Выберите хотя бы одно поле" }}
                render={({ field }) => (
                  <GroupByField
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.group_by)}
                  />
                )}
              />
            </Field>

            <details open={Boolean(minCategories.trim()) || undefined} className="group rounded-xl border border-line-muted">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <ChevronRight aria-hidden className="size-4 text-ink-muted transition-transform group-open:rotate-90" />
                Дополнительные параметры
                {!minCategories.trim() && (
                  <span className="font-normal text-ink-muted">· минимум уникальных категорий не задан</span>
                )}
              </summary>
              <div className="flex flex-col gap-1.5 border-t border-line-muted px-3 py-3">
                <Field label="Минимум уникальных категорий" error={errors.min_unique_categories?.message}>
                  <input
                    {...register("min_unique_categories", {
                      validate: (value) => !value.trim() || isPositiveInt(value) || "Целое число не меньше 1",
                    })}
                    inputMode="numeric"
                    placeholder="Не задано"
                    aria-invalid={Boolean(errors.min_unique_categories) || undefined}
                    className={cn(controlClass, "max-w-[160px]")}
                  />
                </Field>
                <p className="text-[11px] text-ink-muted">
                  Считает разнообразие категорий обнаружения в цепочке — не число инцидентов и не количество
                  RAW-событий. Для обычного двухшагового правила оставьте незаданным.
                </p>
              </div>
            </details>
          </Section>

          {/* 4. Результат срабатывания */}
          <Section index={4} title="Результат срабатывания">
            <div className="grid gap-4 @md:grid-cols-2">
              <Field label="Критичность" required>
                <Controller
                  control={control}
                  name="severity"
                  render={({ field }) => (
                    <SelectBox
                      value={field.value}
                      ariaLabel="Критичность"
                      onChange={(value) => field.onChange(value as CorrelationSeverity)}
                      prefix={
                        <span className={cn("block size-2 rounded-full", CORRELATION_SEVERITY_DOT[field.value])} />
                      }
                    >
                      {[...CORRELATION_SEVERITIES].reverse().map((severity) => (
                        <option key={severity} value={severity}>
                          {CORRELATION_SEVERITY_LABELS[severity]}
                        </option>
                      ))}
                    </SelectBox>
                  )}
                />
              </Field>
              <Field
                label="Confidence"
                required
                hint="Заданный параметр правила, а не рассчитанная вероятность атаки"
                error={errors.confidence?.message}
              >
                <div className="relative">
                  <input
                    {...register("confidence", {
                      validate: (value) =>
                        (/^\d+$/.test(value.trim()) && Number(value) <= 100) || "Целое число от 0 до 100",
                    })}
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.confidence) || undefined}
                    className={cn(controlClass, "pr-14")}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-ink-muted">
                    / 100
                  </span>
                </div>
              </Field>
            </div>
            <Field label="Рекомендации аналитику" hint="Каждая рекомендация с новой строки">
              <textarea
                {...register("recommendations")}
                rows={3}
                placeholder="Проверить связанные веб-запросы и наличие успешной эксплуатации"
                className={textareaClass}
              />
            </Field>
            <Field label="Теги">
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <ChipsInput values={field.value} onChange={field.onChange} placeholder="web, exploit-chain…" />
                )}
              />
            </Field>
          </Section>

          {/* 5. MITRE ATT&CK */}
          <Section
            index={5}
            title="MITRE ATT&CK — дополнительная классификация"
            aside={<span className="shrink-0 text-[11px] text-ink-muted">Необязательно</span>}
          >
            <Controller
              control={control}
              name="mitre_ids"
              rules={{
                validate: (value) => {
                  const inactive = value.filter((id) => {
                    const technique = techniques.find((item) => item.mitre_id === id);
                    return technique && getMitreTechniqueStatus(technique) !== "active";
                  });
                  return !inactive.length || `Отозванные или устаревшие техники: ${inactive.join(", ")}`;
                },
              }}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5" data-invalid={errors.mitre_ids ? true : undefined}>
                  <MitrePicker value={field.value} onChange={field.onChange} candidates={mitreCandidates} />
                  {errors.mitre_ids?.message && (
                    <p className="text-[11px] text-red-600">{errors.mitre_ids.message}</p>
                  )}
                </div>
              )}
            />
          </Section>
        </div>

        {/* Тестирование монтируется при открытии вкладки, чтобы пример брал актуальные значения формы */}
        {tab === "test" && (
          <div className={cn(isPage && "rounded-2xl border border-line bg-white p-5")}>
            <CorrelationRuleTestPanel getRule={() => formValuesToPayload(getValues())} />
          </div>
        )}

        {tab === "history" && history}
      </div>

      <footer
        className={cn(
          "flex flex-wrap items-center gap-2 border-t border-line-muted bg-white/95 px-5 py-4 backdrop-blur",
          isPage ? "sticky bottom-0 z-10 -mx-1 rounded-2xl border border-line" : "rounded-b-2xl",
        )}
      >
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
          <Save className="size-4" />
          {isSaving ? "Сохранение..." : "Сохранить правило"}
        </button>
      </footer>
    </form>
  );
}
