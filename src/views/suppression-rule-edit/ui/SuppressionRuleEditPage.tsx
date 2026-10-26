import { EditSuppressionRuleForm } from "@/features/suppression-rule-upsert";

export function SuppressionRuleEditPage({ suppressionId }: { suppressionId: string }) {
  return <EditSuppressionRuleForm suppressionId={suppressionId} />;
}
