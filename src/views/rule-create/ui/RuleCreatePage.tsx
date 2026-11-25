import { RuleCreate } from "@/widgets/rules/details";

export function RuleCreatePage({ copyFrom }: { copyFrom?: string }) {
  return <RuleCreate copyFrom={copyFrom} />;
}
