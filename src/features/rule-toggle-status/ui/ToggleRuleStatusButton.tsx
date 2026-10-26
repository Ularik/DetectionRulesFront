"use client";

import type { RuleType } from "@/entities/rule";
import { useToggleRuleStatus } from "../model/useToggleRuleStatus";

export function ToggleRuleStatusButton({
  rule,
}: {
  rule: Pick<RuleType, "rule_id" | "enabled">;
}) {
  const { mutate, isPending } = useToggleRuleStatus();

  return (
    <button
      type="button"
      aria-label={rule.enabled ? "Выключить" : "Включить"}
      disabled={isPending}
      onClick={() => mutate(rule)}
      className="inline-flex h-10 px-1 shrink-0 items-center justify-center"
    >
      {rule.enabled ? "Выключить" : "Включить"}
    </button>
  );
}
