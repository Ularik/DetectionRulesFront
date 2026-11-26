"use client";

import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  Clock3,
  Gauge,
  Info,
  Layers,
  RefreshCw,
  Share2,
  ShieldCheck,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/utils";
import {
  ENGINE_SETTINGS_SECTIONS,
  formatEngineSettingsDate,
  useEngineSettings,
  validateEngineSettingsValue,
  type EngineSettings,
  type EngineSettingsField,
  type EngineSettingsSection,
  type EngineSettingsSectionKey,
} from "@/entities/engine-config";
import { useUpdateEngineSettings, useValidateEngineSettings } from "@/features/engine-settings/update";
import { ResetEngineSettingsButton } from "@/features/engine-settings/reset";

// Вёрстка по макету public/images/engine.jpeg: слева форма по разделам EngineSettings, справа —
// информация о текущей конфигурации и описание параметров

type FormValues = Record<EngineSettingsSectionKey, Record<string, string>>;

// Раскладка разделов: «inline» — подпись слева от поля, «stacked» — подпись над полем
const SECTION_VIEW: Record<
  EngineSettingsSectionKey,
  { icon: LucideIcon; variant: "inline" | "stacked"; columns: 1 | 2 | 4 }
> = {
  correlation: { icon: Share2, variant: "inline", columns: 1 },
  ioc_scoring: { icon: Target, variant: "inline", columns: 2 },
  asset_scoring: { icon: Layers, variant: "stacked", columns: 4 },
  decision: { icon: Gauge, variant: "stacked", columns: 4 },
  attack_tracker: { icon: Clock3, variant: "inline", columns: 2 },
};

const PARAMETER_NOTES: [string, string][] = [
  ["Окно агрегации событий", "интервал, в котором события объединяются для корреляции."],
  ["TTL атаки / кампании", "время жизни объекта до автоматического завершения."],
  ["IOC Scoring", "дополнительные баллы за совпадения с индикаторами (IOC) и пороги их значимости."],
  ["Asset Scoring", "дополнительные баллы с учётом критичности актива."],
  ["Decision", "итоговые пороги для присвоения уровня серьёзности (Critical / High / Medium / Low)."],
  ["Attack Tracker", "тайм-ауты без активности, после которых атака или кампания считается завершённой."],
];

function toFormValues(settings: EngineSettings): FormValues {
  return Object.fromEntries(
    ENGINE_SETTINGS_SECTIONS.map(({ key }) => [
      key,
      Object.fromEntries(
        Object.entries(settings[key] as unknown as Record<string, number>).map(([field, value]) => [
          field,
          String(value),
        ]),
      ),
    ]),
  ) as FormValues;
}

function toPayload(values: FormValues, settingsId: string): EngineSettings {
  const sections = Object.fromEntries(
    Object.entries(values).map(([key, fields]) => [
      key,
      Object.fromEntries(Object.entries(fields).map(([field, value]) => [field, Number(value)])),
    ]),
  ) as unknown as Omit<EngineSettings, "settings_id">;
  return { settings_id: settingsId, ...sections };
}

function collectErrors(values: FormValues) {
  const errors: Record<string, string> = {};
  for (const section of ENGINE_SETTINGS_SECTIONS) {
    for (const field of section.groups.flat()) {
      const error = validateEngineSettingsValue(field, values[section.key]?.[field.key] ?? "");
      if (error) errors[`${section.key}.${field.key}`] = error;
    }
  }
  return errors;
}

const inputClass =
  "h-9 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-brand-light focus:ring-2 focus:ring-brand-light/20";

function FieldLabel({ field, htmlFor }: { field: EngineSettingsField; htmlFor: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink">
      <label htmlFor={htmlFor} className="min-w-0">
        {field.label}
      </label>
      <span title={field.hint} aria-label={field.hint} className="shrink-0 cursor-help text-ink-muted">
        <Info className="size-4" aria-hidden />
      </span>
    </span>
  );
}

function NumberField({
  id,
  field,
  value,
  error,
  variant,
  onChange,
}: {
  id: string;
  field: EngineSettingsField;
  value: string;
  error?: string;
  variant: "inline" | "stacked";
  onChange: (value: string) => void;
}) {
  const input = (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      step={1}
      min={field.min ?? (field.exclusiveMin !== undefined ? field.exclusiveMin + 1 : undefined)}
      max={field.max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(inputClass, error ? "border-red-400" : "border-line")}
    />
  );
  const errorText = error && (
    <p id={`${id}-error`} className="text-xs text-red-600">
      {error}
    </p>
  );

  if (variant === "stacked") {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <FieldLabel field={field} htmlFor={id} />
        {input}
        {errorText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(96px,180px)_2.5rem] items-center gap-x-3 gap-y-1">
      <FieldLabel field={field} htmlFor={id} />
      {input}
      <span className="text-sm text-ink-muted">{field.unit}</span>
      {errorText && <div className="col-start-2 col-end-4">{errorText}</div>}
    </div>
  );
}

function SettingsSection({
  section,
  values,
  errors,
  onChange,
}: {
  section: EngineSettingsSection;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const view = SECTION_VIEW[section.key];
  const Icon = view.icon;
  const renderField = (field: EngineSettingsField) => (
    <NumberField
      key={field.key}
      id={`engine-${section.key}-${field.key}`}
      field={field}
      value={values[field.key] ?? ""}
      error={errors[`${section.key}.${field.key}`]}
      variant={view.variant}
      onChange={(value) => onChange(field.key, value)}
    />
  );

  // Несколько групп (IOC Scoring) — колонки с вертикальным разделителем; одна группа — сетка полей
  const body =
    section.groups.length > 1 ? (
      <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2 lg:divide-x lg:divide-line-muted">
        {section.groups.map((group, index) => (
          <div key={index} className={cn("flex flex-col gap-3", index > 0 && "lg:pl-8")}>
            {group.map(renderField)}
          </div>
        ))}
      </div>
    ) : (
      <div
        className={cn(
          "grid gap-x-8 gap-y-3",
          view.columns === 2 && "lg:grid-cols-2",
          view.columns === 4 && "sm:grid-cols-2 xl:grid-cols-4",
          view.columns === 1 && "max-w-[640px]",
        )}
      >
        {section.groups[0].map(renderField)}
      </div>
    );

  return (
    <section aria-labelledby={`engine-section-${section.key}`} className="flex flex-col gap-4 px-5 py-5">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-7 shrink-0 text-brand" aria-hidden />
        <div>
          <h2 id={`engine-section-${section.key}`} className="text-base font-semibold text-ink">
            {section.title}
          </h2>
          <p className="text-xs text-ink-muted">{section.description}</p>
        </div>
      </div>
      <div className="sm:pl-10">{body}</div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="flex items-center gap-3 text-ink">
        <Icon className="size-5 text-ink-muted" aria-hidden />
        {label}
      </span>
      <span className="min-w-0 text-right break-words text-ink">{children}</span>
    </div>
  );
}

function StatusPill({ state }: { state: "loading" | "dirty" | "synced" }) {
  const { label, className, dot } = {
    loading: { label: "Загрузка настроек…", className: "bg-surface-muted text-ink-muted", dot: "bg-ink-muted" },
    dirty: { label: "Есть несохранённые изменения", className: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
    synced: { label: "Настройки актуальны", className: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  }[state];
  return (
    <span
      role="status"
      className={cn("inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium", className)}
    >
      <span className={cn("size-2.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-6 rounded-2xl border border-line bg-white p-5" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-5 w-64 rounded bg-line-muted" />
          <div className="h-9 rounded bg-line-muted" />
        </div>
      ))}
    </div>
  );
}

export function EngineSettingsEditor() {
  const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } = useEngineSettings();
  const update = useUpdateEngineSettings();
  const validate = useValidateEngineSettings();

  const [values, setValues] = useState<FormValues | null>(null);
  const [syncedAt, setSyncedAt] = useState(0);

  // Новые данные с сервера (первая загрузка, «Обновить из БД», после сохранения/сброса) заменяют форму
  if (data && dataUpdatedAt !== syncedAt) {
    setSyncedAt(dataUpdatedAt);
    setValues(toFormValues(data));
  }

  const baseline = data ? toFormValues(data) : null;
  const isDirty = Boolean(values && baseline && JSON.stringify(values) !== JSON.stringify(baseline));
  const errors = values ? collectErrors(values) : {};
  const hasErrors = Object.keys(errors).length > 0;
  const isBusy = update.isPending || validate.isPending;

  const setField = (section: EngineSettingsSectionKey, field: string, value: string) =>
    setValues((current) => current && { ...current, [section]: { ...current[section], [field]: value } });

  const payload = () => toPayload(values as FormValues, data?.settings_id ?? "default");

  return (
    <section className={pageStackClass}>
      <PageHeader
        title="Настройки движка"
        description="Параметры корреляции, скоринга и порогов принятия решений SOC Engine"
        actions={
          <>
            <StatusPill state={!data ? "loading" : isDirty ? "dirty" : "synced"} />
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title={isDirty ? "Несохранённые изменения будут заменены значениями из БД" : undefined}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-light bg-white px-4 text-sm font-semibold whitespace-nowrap text-brand-light transition-colors hover:bg-brand/5 disabled:opacity-60"
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              Обновить из БД
            </button>
          </>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          {isError && !data ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-ink">Не удалось загрузить настройки движка</p>
              <Button variant="outline" onClick={() => refetch()}>
                Повторить попытку
              </Button>
            </div>
          ) : isPending || !values ? (
            <EditorSkeleton />
          ) : (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (!hasErrors && isDirty) update.mutate(payload());
              }}
              className="flex flex-col gap-5"
            >
              <div className="divide-y divide-line-muted rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
                {ENGINE_SETTINGS_SECTIONS.map((section) => (
                  <SettingsSection
                    key={section.key}
                    section={section}
                    values={values[section.key]}
                    errors={errors}
                    onChange={(field, value) => setField(section.key, field, value)}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!isDirty || hasErrors || isBusy}
                  className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand-light disabled:opacity-50"
                >
                  {update.isPending ? "Сохранение..." : "Сохранить изменения"}
                </button>
                <button
                  type="button"
                  onClick={() => baseline && setValues(baseline)}
                  disabled={!isDirty || isBusy}
                  className="inline-flex h-11 items-center rounded-xl border border-brand-light bg-white px-5 text-sm font-semibold whitespace-nowrap text-brand-light transition-colors hover:bg-brand/5 disabled:opacity-50"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => validate.mutate(payload())}
                  disabled={hasErrors || isBusy}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:bg-surface-muted disabled:opacity-50"
                >
                  <ShieldCheck className="size-4 text-brand-light" />
                  {validate.isPending ? "Проверка..." : "Проверить"}
                </button>
                <div className="ml-auto">
                  <ResetEngineSettingsButton disabled={isBusy} />
                </div>
              </div>
              {hasErrors && (
                <p className="text-sm text-red-600">Исправьте ошибки в полях, чтобы сохранить настройки.</p>
              )}
            </form>
          )}
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-5">
          <div className="rounded-2xl border border-line bg-white px-5 py-4">
            <h2 className="mb-2 text-base font-semibold text-ink">Информация о настройках</h2>
            <InfoRow icon={Layers} label="ID конфигурации">
              <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium">
                {data?.settings_id ?? "—"}
              </span>
            </InfoRow>
            <InfoRow icon={UserRound} label="Обновил">
              {data?.updated_by ?? "—"}
            </InfoRow>
            <InfoRow icon={CalendarDays} label="Дата обновления">
              {formatEngineSettingsDate(data?.updated_at)}
            </InfoRow>
          </div>

          <div className="rounded-2xl border border-[#cfe0f7] bg-[#eef5ff] px-5 py-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <Info className="size-5 text-brand-light" aria-hidden />
              Описание параметров
            </h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[13px] text-ink">
              {PARAMETER_NOTES.map(([term, text]) => (
                <li key={term}>
                  <span className="font-semibold">{term}</span> — {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
