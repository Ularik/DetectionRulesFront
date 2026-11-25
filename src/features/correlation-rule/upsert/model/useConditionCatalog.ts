import { useMemo } from "react";
import { useAttackTypes } from "@/entities/attack-type";
import {
  isRuleStep,
  ruleStepId,
  useSequenceOptions,
} from "@/entities/correlation-rule";
import { useAllRules, useDetectionCategories, type RuleType } from "@/entities/rule";
import type { SearchSelectOption } from "@/shared/ui/form";

// Три типа условий sequence (постановка «конструктор правила корреляции»):
//   Detection Rule     → "rule:<rule_id>"
//   Detection Category → категория детектирования (sql_injection, path_traversal…)
//   Attack Type        → тип атаки (network_scan…)

export type ConditionKind = "rule" | "category" | "attack_type";

export const CONDITION_KINDS: { value: ConditionKind; label: string; hint: string }[] = [
  {
    value: "rule",
    label: "Detection Rule",
    hint: "Конкретное правило обнаружения, например WEB-PATH-001",
  },
  {
    value: "category",
    label: "Detection Category",
    hint: "Вид обнаружения независимо от конкретного правила: sql_injection, xss…",
  },
  {
    value: "attack_type",
    label: "Attack Type",
    hint: "Тип атаки инцидента, в том числе вне конкретного правила обнаружения",
  },
];

export const CONDITION_KIND_LABELS = Object.fromEntries(
  CONDITION_KINDS.map((item) => [item.value, item.label]),
) as Record<ConditionKind, string>;

export interface ConditionInfo {
  kind: ConditionKind;
  /** rule_id, категория или тип атаки */
  value: string;
  title: string;
  subtitle?: string;
  /** Правило обнаружения шага (если найдено) */
  rule?: RuleType;
  /** Что не так со значением (старое правило, отключённое правило обнаружения…) */
  warning?: string;
}

export function useConditionCatalog() {
  const rulesQuery = useAllRules();
  const categoriesQuery = useDetectionCategories();
  const attackTypesQuery = useAttackTypes();
  const sequenceQuery = useSequenceOptions();

  return useMemo(() => {
    const rules = rulesQuery.data?.items ?? [];
    const rulesById = new Map(rules.map((rule) => [rule.rule_id, rule]));
    const categories = categoriesQuery.data ?? [];
    const categoryByValue = new Map(categories.map((item) => [item.category, item]));
    const attackTypes = attackTypesQuery.data?.items ?? [];
    const attackByValue = new Map(attackTypes.map((item) => [item.value, item]));
    const sequenceValues = new Set((sequenceQuery.data ?? []).map((item) => item.value));

    const ruleOptions: SearchSelectOption[] = [...rules]
      .sort((a, b) => a.rule_id.localeCompare(b.rule_id))
      .map((rule) => ({
        value: rule.rule_id,
        label: rule.rule_id,
        description: rule.description ?? undefined,
        hint: rule.enabled ? undefined : "отключено",
        keywords: [rule.description, rule.category, rule.attack_type].filter(Boolean).join(" "),
      }));

    // Если справочник категорий недоступен — категории берутся из значений /sequence, которых нет среди типов атак
    const categoryOptions: SearchSelectOption[] = categories.length
      ? categories.map((item) => ({
          value: item.category,
          label: item.name || item.category,
          description: item.description || undefined,
          hint: item.enabled ? undefined : "отключена",
        }))
      : [...sequenceValues]
          .filter((value) => !attackByValue.has(value))
          .map((value) => ({ value, label: value }));

    const attackOptions: SearchSelectOption[] = attackTypes.length
      ? attackTypes.map((item) => ({ value: item.value, label: item.label }))
      : [...sequenceValues]
          .filter((value) => !categoryByValue.has(value))
          .map((value) => ({ value, label: value }));

    const isPending = rulesQuery.isPending || categoriesQuery.isPending || attackTypesQuery.isPending;

    const describe = (step: string): ConditionInfo => {
      if (isRuleStep(step)) {
        const ruleId = ruleStepId(step);
        const rule = rulesById.get(ruleId);
        return {
          kind: "rule",
          value: ruleId,
          title: ruleId,
          subtitle: rule?.description ?? undefined,
          rule,
          warning: rulesQuery.isPending
            ? undefined
            : !rule
              ? "Правило обнаружения не найдено — возможно, удалено"
              : !rule.enabled
                ? "Правило обнаружения отключено — шаг не сработает, пока его не включат"
                : undefined,
        };
      }
      const category = categoryByValue.get(step);
      if (category) {
        return {
          kind: "category",
          value: step,
          title: category.name || step,
          subtitle: category.name && category.name !== step ? step : undefined,
          warning: category.enabled ? undefined : "Категория детектирования отключена",
        };
      }
      const attack = attackByValue.get(step);
      const known = attack || sequenceValues.has(step) || categoryOptions.some((item) => item.value === step);
      return {
        kind: categoryOptions.some((item) => item.value === step) ? "category" : "attack_type",
        value: step,
        title: attack?.label ?? step,
        subtitle: attack && attack.label !== step ? step : undefined,
        warning: known || isPending ? undefined : "Значения нет в справочниках типов атак и категорий",
      };
    };

    return { rulesById, ruleOptions, categoryOptions, attackOptions, describe, isPending };
  }, [
    rulesQuery.data,
    rulesQuery.isPending,
    categoriesQuery.data,
    categoriesQuery.isPending,
    attackTypesQuery.data,
    attackTypesQuery.isPending,
    sequenceQuery.data,
  ]);
}

export type ConditionCatalog = ReturnType<typeof useConditionCatalog>;
