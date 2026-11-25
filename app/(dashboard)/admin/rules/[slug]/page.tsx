import { RuleDetailPage } from "@/views/rule-detail";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  // params приходят URL-кодированными, а id дальше снова кодируется в routes.* и API — декодируем
  return (
    <RuleDetailPage
      ruleId={decodeURIComponent(slug)}
      tab={typeof tab === "string" ? tab : undefined}
    />
  );
}
