import { SuppressionRuleCreate } from "@/widgets/suppression-rules/details";

export function SuppressionRuleCreatePage({ copyFrom }: { copyFrom?: string }) {
  return <SuppressionRuleCreate copyFrom={copyFrom} />;
}
