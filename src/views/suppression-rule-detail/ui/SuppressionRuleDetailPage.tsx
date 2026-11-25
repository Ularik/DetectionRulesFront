import { SuppressionRuleDetails } from "@/widgets/suppression-rules/details";

// ?tab=test — карточка сразу на вкладке «Тестирование»
export function SuppressionRuleDetailPage({ suppressionId, tab }: { suppressionId: string; tab?: string }) {
  return <SuppressionRuleDetails suppressionId={suppressionId} initialTab={tab === "test" ? "test" : undefined} />;
}
