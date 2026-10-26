"use client";

import { Trash2 } from "lucide-react";
import { useDeleteRule } from "../model/useDeleteRule";

export function DeleteRuleButton({ ruleId }: { ruleId: string }) {
  const { mutate, isPending } = useDeleteRule();

  return (
    <button
      aria-label="Удалить"
      type="button"
      disabled={isPending}
      onClick={() => mutate(ruleId)}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
