import { RuleDetails } from "@/widgets/rules/details";

// ?tab=test — вкладка «Тестирование», ?tab=history — «История»
const TABS = ["test", "history"] as const;
type DeepLinkTab = (typeof TABS)[number];

const isDeepLinkTab = (tab: string | undefined): tab is DeepLinkTab =>
  TABS.includes(tab as DeepLinkTab);

export function RuleDetailPage({ ruleId, tab }: { ruleId: string; tab?: string }) {
  return <RuleDetails ruleId={ruleId} initialTab={isDeepLinkTab(tab) ? tab : undefined} />;
}
