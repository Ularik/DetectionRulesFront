import { useMutation } from "@tanstack/react-query";
import { testRule } from "@/entities/rule";

/** POST /rules/admin/test — проверка правила на событии без сохранения */
export function useTestRule() {
  return useMutation({ mutationFn: testRule });
}
