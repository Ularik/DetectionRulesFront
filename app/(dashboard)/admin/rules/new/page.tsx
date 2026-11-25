import { RuleCreatePage } from "@/views/rule-create";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ copy?: string | string[] }>;
}) {
  const { copy } = await searchParams;
  // ?copy=<rule_id> — «Копировать»: форма открывается с копией правила
  return <RuleCreatePage copyFrom={typeof copy === "string" ? copy : undefined} />;
}
