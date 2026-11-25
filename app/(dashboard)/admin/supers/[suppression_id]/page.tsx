import { SuppressionRuleDetailPage } from "@/views/suppression-rule-detail";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ suppression_id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ suppression_id }, { tab }] = await Promise.all([params, searchParams]);
  // params приходят URL-кодированными, а id дальше снова кодируется в routes.* и API — декодируем
  return (
    <SuppressionRuleDetailPage
      suppressionId={decodeURIComponent(suppression_id)}
      tab={typeof tab === "string" ? tab : undefined}
    />
  );
}
