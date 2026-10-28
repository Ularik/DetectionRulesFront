import { EditCorrelationRuleForm } from "@/features/correlation-rule-upsert";

export function CorrelationRuleDetailPage({ correlationId }: { correlationId: string }) {
  return <EditCorrelationRuleForm correlationId={correlationId} />;
}
