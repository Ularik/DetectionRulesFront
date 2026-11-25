import { CorrelationRuleCreate } from "@/widgets/correlation-rules/details";

export function CorrelationRuleCreatePage({ copyFrom }: { copyFrom?: string }) {
  return <CorrelationRuleCreate copyFrom={copyFrom} />;
}
