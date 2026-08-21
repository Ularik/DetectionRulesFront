"use client";

import {
  useForm,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RuleCreateType } from "@/types";
import { useSeverities } from "@/lib/hooks/severities";
import { useCreateRule } from "@/lib/hooks/rules";
import ArrayField, { SectionTitle, FieldError } from "@/services/utils";
import { toast } from "sonner";


const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition " +
  "focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20";

const errorClass = "border-red-500 focus-visible:ring-red-500";


export default function RuleForm() {
  const { data = [], isPending: isSeverityLoading } = useSeverities();
  const isPending = false;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RuleCreateType>({
    defaultValues: {
      rule_id: "",
      rule_type: "",
      attack_type: "",
      category: "",
      scenario_type: "",
      scope: "",
      severity_hint: "info",
      confidence: 0,
      pattern: "",
      match_type: "",
      case_sensitive: false,
      fields: [],
      mitre_ids: [],
      tactics: [],
      tags: [],
      recommendations: [],
      description: "",
      explanation_template: "",
      false_positive_notes: "",
      enabled: false,
      enabled_reason: "",
    },
  });

  const {
    fields: fieldItems,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: "fields" as never,
  });

  const {
    fields: mitrItems,
    append: appendMitre,
    remove: removeMitre,
  } = useFieldArray({
    control,
    name: "mitre_ids" as never,
  });

  const {
    fields: tacticItems,
    append: appendTactic,
    remove: removeTactic,
  } = useFieldArray({
    control,
    name: "tactics" as never,
  });

  const {
    fields: tagItems,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags" as never,
  });

  const {
    fields: recItems,
    append: appendRec,
    remove: removeRec,
  } = useFieldArray({
    control,
    name: "recommendations" as never,
  });

  const { mutate } = useCreateRule();
  const onSubmit = (data: RuleCreateType) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        toast.success("Создали правило!", { position: "top-center" });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold text-[#1E2B6D]">Создание правила</h2>

      {/* ── Идентификация ── */}
      <SectionTitle>Идентификация</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Rule ID</label>
          <Input
            {...register("rule_id", { required: "Введите ID" })}
            className={`${inputClass} ${errors.rule_id ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.rule_id?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Rule Type</label>
          <Input
            {...register("rule_type", { required: "Введите тип правила" })}
            className={`${inputClass} ${errors.rule_type ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.rule_type?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Attack Type
          </label>
          <Input
            {...register("attack_type", { required: "Введите тип атаки" })}
            className={`${inputClass} ${errors.attack_type ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.attack_type?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Input
            {...register("category", { required: "Введите категорию" })}
            className={`${inputClass} ${errors.category ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Scenario Type
          </label>
          <Input
            {...register("scenario_type", { required: "Введите тип сценария" })}
            className={`${inputClass} ${errors.scenario_type ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.scenario_type?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Scope</label>
          <Input
            {...register("scope", { required: "Введите scope" })}
            className={`${inputClass} ${errors.scope ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.scope?.message} />
        </div>
      </div>

      {/* ── Оценка ── */}
      <SectionTitle>Оценка</SectionTitle>

      <div className="w-full">
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium text-gray-700">
            Критичность
          </label>
          <Controller
            control={control}
            name="severity_hint"
            rules={{ required: "Выберите критичность" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <SelectTrigger
                  className={`w-full ${errors.severity_hint ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Выберите критичность" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {data.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.severity_hint?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Confidence (0–100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            {...register("confidence", {
              required: "Введите уверенность",
              min: { value: 0, message: "Минимум 0" },
              max: { value: 100, message: "Максимум 100" },
              valueAsNumber: true,
            })}
            className={`${inputClass} ${errors.confidence ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.confidence?.message} />
        </div>
      </div>

      {/* ── Паттерн ── */}
      <SectionTitle>Паттерн</SectionTitle>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Pattern</label>
        <Input
          {...register("pattern", { required: "Введите паттерн" })}
          className={`${inputClass} ${errors.pattern ? errorClass : ""}`}
          disabled={isPending}
        />
        <FieldError message={errors.pattern?.message} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Match Type
          </label>
          <Input
            {...register("match_type", { required: "Введите тип совпадения" })}
            className={`${inputClass} ${errors.match_type ? errorClass : ""}`}
            disabled={isPending}
          />
          <FieldError message={errors.match_type?.message} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Case Sensitive
          </label>
          <div className="flex items-center gap-3 h-[46px]">
            <Controller
              control={control}
              name="case_sensitive"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  disabled={isPending}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/40 ${
                    field.value ? "bg-[#1E2B6D]" : "bg-gray-200"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              )}
            />
            <span className="text-sm text-gray-500">
              {/* динамически отображаем состояние */}
            </span>
          </div>
        </div>
      </div>

      {/* ── Описания ── */}
      <SectionTitle>Описания</SectionTitle>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Описание</label>
        <Textarea
          {...register("description", { required: "Введите описание" })}
          className={`${inputClass} min-h-[80px] resize-none ${errors.description ? errorClass : ""}`}
          disabled={isPending}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Шаблон объяснения
        </label>
        <Textarea
          {...register("explanation_template")}
          className={`${inputClass} min-h-[80px] resize-none`}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Заметки о ложных срабатываниях
        </label>
        <Textarea
          {...register("false_positive_notes")}
          className={`${inputClass} min-h-[80px] resize-none`}
          disabled={isPending}
        />
      </div>

      {/* ── Массивы ── */}
      <SectionTitle>Классификация</SectionTitle>

      <ArrayField
        label="Fields"
        fieldItems={fieldItems}
        inputClass={inputClass}
        errorClass={errorClass}
        register={register}
        append={appendField}
        remove={removeField}
        errors={(errors.fields as never) ?? []}
        name="fields"
        isPending={isPending}
        addLabel="Добавить поле"
      />

      <ArrayField
        label="MITRE IDs"
        fieldItems={mitrItems}
        inputClass={inputClass}
        errorClass={errorClass}
        register={register}
        append={appendMitre}
        remove={removeMitre}
        errors={(errors.mitre_ids as never) ?? []}
        name="mitre_ids"
        isPending={isPending}
        addLabel="Добавить MITRE ID"
      />

      <ArrayField
        label="Tactics"
        fieldItems={tacticItems}
        inputClass={inputClass}
        errorClass={errorClass}
        register={register}
        append={appendTactic}
        remove={removeTactic}
        errors={(errors.tactics as never) ?? []}
        name="tactics"
        isPending={isPending}
        addLabel="Добавить тактику"
      />

      <ArrayField
        label="Tags"
        fieldItems={tagItems}
        inputClass={inputClass}
        errorClass={errorClass}
        register={register}
        append={appendTag}
        remove={removeTag}
        errors={(errors.tags as never) ?? []}
        name="tags"
        isPending={isPending}
        addLabel="Добавить тег"
      />

      <ArrayField
        label="Рекомендации"
        fieldItems={recItems}
        inputClass={inputClass}
        errorClass={errorClass}
        register={register}
        append={appendRec}
        remove={removeRec}
        errors={(errors.recommendations as never) ?? []}
        name="recommendations"
        isPending={isPending}
        addLabel="Добавить рекомендацию"
      />

      {/* ── Статус ── */}
      <SectionTitle>Статус</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Enabled</label>
          <div className="flex items-center gap-3 h-[46px]">
            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  disabled={isPending}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/40 ${
                    field.value ? "bg-[#1E2B6D]" : "bg-gray-200"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Причина статуса
          </label>
          <Input
            {...register("enabled_reason")}
            className={inputClass}
            disabled={isPending}
          />
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition hover:bg-[#162356] disabled:opacity-50 h-12"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Сохранение...
          </span>
        ) : (
          "Создать правило"
        )}
      </button>
    </form>
  );
}
