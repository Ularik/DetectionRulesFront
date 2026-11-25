import { CorrelationRuleDetailPage } from "@/views/correlation-rule-detail";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ correlation_id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ correlation_id }, { tab }] = await Promise.all([params, searchParams]);
  // params приходят URL-кодированными, а id дальше снова кодируется в routes.* и API — декодируем
  return (
    <CorrelationRuleDetailPage
      correlationId={decodeURIComponent(correlation_id)}
      tab={typeof tab === "string" ? tab : undefined}
    />
  );
}
