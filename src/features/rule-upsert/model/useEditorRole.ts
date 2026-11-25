import { useMe } from "@/entities/user";
import type { RuleEditorRole } from "@/entities/rule";

/** Аналитик сохраняет правила через /rules/analyst/*, остальные — через /rules/admin/* */
export function useEditorRole(): RuleEditorRole {
  const { data: user } = useMe();
  return user?.role === "ANALYST" ? "ANALYST" : "ADMIN";
}
