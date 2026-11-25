"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/form";
import { cn } from "@/shared/lib/utils";
import {
  NORMALIZATION_FORMATS,
  formatNormalizationFormat,
  useNormalizationFields,
  type FieldMapping,
  type NormalizationFieldType,
  type NormalizationProfileType,
} from "@/entities/normalization-profile";

// Типы из уже заведённых профилей — подсказки, ввести можно любой
const SOURCE_TYPE_SUGGESTIONS = ["waf", "firewall", "ips", "ids", "edr", "proxy", "linux", "windows"];
const NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

type MappingRow = { key: string; field: string; aliases: string };

let rowCounter = 0;
const newRow = (field = "", aliases = ""): MappingRow => ({
  key: `row-${++rowCounter}`,
  field,
  aliases,
});

const toRows = (mapping: FieldMapping | undefined) =>
  Object.entries(mapping ?? {}).map(([field, aliases]) => newRow(field, aliases.join(", ")));

const parseList = (value: string) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

type Props = {
  title: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  /** Имя профиля — ключ в URL API, при редактировании его не меняем */
  lockName?: boolean;
  initialValues?: NormalizationProfileType;
  onSubmit: (payload: NormalizationProfileType) => void;
};

// Общая форма создания и редактирования профиля нормализации (NormalizationProfileSchema)
export function ProfileForm({
  title,
  backHref,
  backLabel,
  submitLabel,
  pendingLabel,
  isPending,
  lockName,
  initialValues,
  onSubmit,
}: Props) {
  const router = useRouter();
  const datalistId = useId();
  const { data: catalog } = useNormalizationFields();

  const [name, setName] = useState(initialValues?.source_name ?? "");
  const [sourceType, setSourceType] = useState(initialValues?.source_type ?? "");
  const [format, setFormat] = useState<string>(initialValues?.format ?? "json");
  const [enabled, setEnabled] = useState(initialValues?.enabled ?? true);
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [rows, setRows] = useState<MappingRow[]>(() => {
    const initial = toRows(initialValues?.field_mapping);
    return initial.length ? initial : [newRow()];
  });

  const fields = catalog?.items ?? [];
  const categories = catalog?.categories ?? [];
  const fieldByName = new Map(fields.map((field) => [field.field, field]));
  const usedFields = new Set(rows.map((row) => row.field).filter(Boolean));

  const updateRow = (key: string, patch: Partial<MappingRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  // При выборе поля из каталога подставляем типичные имена полей источника
  const handleFieldChange = (row: MappingRow, field: string) => {
    const example = fieldByName.get(field)?.example_source_fields;
    updateRow(row.key, {
      field,
      aliases: row.aliases.trim() || !example ? row.aliases : example.join(", "),
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Введите название профиля", { position: "top-center" });
      return;
    }
    if (!lockName && !NAME_PATTERN.test(trimmedName)) {
      toast.error("Название: только латиница, цифры, «_», «-» и «.»", { position: "top-center" });
      return;
    }
    if (!sourceType.trim()) {
      toast.error("Укажите тип источника", { position: "top-center" });
      return;
    }

    const filled = rows.filter((row) => row.field.trim() || row.aliases.trim());
    const field_mapping: FieldMapping = {};
    for (const row of filled) {
      const field = row.field.trim();
      const aliases = parseList(row.aliases);
      if (!field || !aliases.length) {
        toast.error("В каждой строке сопоставления укажите поле SOC Engine и поля источника", {
          position: "top-center",
        });
        return;
      }
      if (field in field_mapping) {
        toast.error(`Поле «${field}» указано несколько раз`, { position: "top-center" });
        return;
      }
      field_mapping[field] = aliases;
    }

    onSubmit({
      source_name: trimmedName,
      source_type: sourceType.trim().toLowerCase(),
      format,
      enabled,
      description: description.trim(),
      field_mapping,
    });
  };

  const renderFieldOptions = (current: string) => {
    const option = (field: NormalizationFieldType) => (
      <option key={field.field} value={field.field} disabled={field.field !== current && usedFields.has(field.field)}>
        {field.field} — {field.label}
      </option>
    );
    const known = categories.map((category) => {
      const items = fields.filter((field) => field.category === category.id);
      return items.length ? (
        <optgroup key={category.id} label={category.label}>
          {items.map(option)}
        </optgroup>
      ) : null;
    });
    const uncategorized = fields.filter(
      (field) => !categories.some((category) => category.id === field.category),
    );
    return (
      <>
        <option value="">Выберите поле</option>
        {current && !fieldByName.has(current) && <option value={current}>{current}</option>}
        {known}
        {uncategorized.map(option)}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand-light"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-line bg-white p-6">
        <fieldset className="space-y-4">
          <legend className="mb-4 text-sm font-semibold text-ink">Основное</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Название"
              required
              hint={lockName ? "Название профиля изменить нельзя" : "Латиница, цифры, «_», «-», «.»"}
            >
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={cn(inputClass, lockName && "bg-surface-muted text-ink-muted")}
                placeholder="generic_waf"
                readOnly={lockName}
                required
              />
            </Field>

            <Field label="Тип источника" required hint="Например: waf, firewall, ips">
              <input
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
                className={inputClass}
                list={datalistId}
                placeholder="waf"
                required
              />
              <datalist id={datalistId}>
                {SOURCE_TYPE_SUGGESTIONS.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </Field>

            <Field label="Формат событий">
              <select value={format} onChange={(event) => setFormat(event.target.value)} className={inputClass}>
                {!NORMALIZATION_FORMATS.includes(format as never) && <option value={format}>{format}</option>}
                {NORMALIZATION_FORMATS.map((item) => (
                  <option key={item} value={item}>
                    {formatNormalizationFormat(item)}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-3 self-end rounded-2xl border border-line bg-surface-muted px-4 py-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-ink">Профиль активен</span>
            </label>

            <Field label="Описание" className="md:col-span-2">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={cn(inputClass, "min-h-[80px] resize-y")}
                placeholder="Например: Generic WAF profile for web attack events"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-sm font-semibold text-ink">
            Сопоставление полей (field_mapping)
          </legend>
          <p className="text-xs text-ink-muted">
            Для каждого поля SOC Engine перечислите через запятую имена полей источника — берётся первое
            найденное в событии.
          </p>

          <div className="overflow-hidden rounded-xl border border-line">
            <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_40px] gap-3 border-b border-line-muted bg-surface-muted px-3 py-2 text-xs font-semibold text-ink md:grid">
              <span>Поле SOC Engine</span>
              <span>Альтернативные поля источника</span>
              <span />
            </div>
            <ul className="divide-y divide-line-muted">
              {rows.map((row) => {
                const description = fieldByName.get(row.field)?.description;
                return (
                  <li
                    key={row.key}
                    className="grid gap-2 px-3 py-2.5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_40px] md:items-start md:gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <select
                        value={row.field}
                        onChange={(event) => handleFieldChange(row, event.target.value)}
                        aria-label="Поле SOC Engine"
                        className={cn(inputClass, "rounded-xl py-2")}
                      >
                        {renderFieldOptions(row.field)}
                      </select>
                      {description && <span className="text-[11px] text-ink-muted">{description}</span>}
                    </div>
                    <input
                      value={row.aliases}
                      onChange={(event) => updateRow(row.key, { aliases: event.target.value })}
                      aria-label="Поля источника"
                      className={cn(inputClass, "rounded-xl py-2 font-mono text-xs")}
                      placeholder="src_ip, source_ip, client_ip"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRows((current) =>
                          current.length > 1 ? current.filter((item) => item.key !== row.key) : [newRow()],
                        )
                      }
                      aria-label="Удалить строку"
                      title="Удалить строку"
                      className="flex size-9 items-center justify-center justify-self-end rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button type="button" variant="outline" onClick={() => setRows((current) => [...current, newRow()])}>
            <Plus className="size-4" />
            Добавить поле
          </Button>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line-muted pt-5">
          <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
