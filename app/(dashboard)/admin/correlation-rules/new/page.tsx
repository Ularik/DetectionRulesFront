import { CorrelationRuleCreatePage } from "@/views/correlation-rule-create";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ copy?: string | string[] }>;
}) {
  const { copy } = await searchParams;
  // ?copy=<correlation_id> — «Копировать»: форма открывается с копией правила
  return <CorrelationRuleCreatePage copyFrom={typeof copy === "string" ? copy : undefined} />;
}
