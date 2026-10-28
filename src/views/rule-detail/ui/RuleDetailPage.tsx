import { RuleDetails } from "@/widgets/rule-details";

export function RuleDetailPage({ ruleId }: { ruleId: string }) {
  return (
    <div className="p-6">
      <RuleDetails ruleId={ruleId} />
    </div>
  );
}
