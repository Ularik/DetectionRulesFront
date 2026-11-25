import { SuppressionRuleCreatePage } from "@/views/suppression-rule-create";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ copy?: string | string[] }>;
}) {
  const { copy } = await searchParams;
  // ?copy=<suppression_id> — «Копировать»: форма открывается с копией правила
  return <SuppressionRuleCreatePage copyFrom={typeof copy === "string" ? copy : undefined} />;
}
