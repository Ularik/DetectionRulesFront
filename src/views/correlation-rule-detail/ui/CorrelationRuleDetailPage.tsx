import { CorrelationRuleDetails } from "@/widgets/correlation-rules/details";

// ?tab=test — вкладка «Тестирование», ?tab=history — «История»
const DEEP_LINK_TABS = ["test", "history"] as const;
type DeepLinkTab = (typeof DEEP_LINK_TABS)[number];

const isDeepLinkTab = (tab: string | undefined): tab is DeepLinkTab =>
  DEEP_LINK_TABS.includes(tab as DeepLinkTab);

export function CorrelationRuleDetailPage({
  correlationId,
  tab,
}: {
  correlationId: string;
  tab?: string;
}) {
  return (
    <CorrelationRuleDetails
      correlationId={correlationId}
      initialTab={isDeepLinkTab(tab) ? tab : undefined}
    />
  );
}
