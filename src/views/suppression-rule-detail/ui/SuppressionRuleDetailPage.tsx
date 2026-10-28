import { SuppressionRuleDetails } from "@/widgets/suppression-rule-details";

export function SuppressionRuleDetailPage({ suppressionId }: { suppressionId: string }) {
  return <SuppressionRuleDetails suppressionId={suppressionId} />;
}
