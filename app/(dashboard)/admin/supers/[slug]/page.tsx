import { SuppressionRuleDetailPage } from "@/views/suppression-rule-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SuppressionRuleDetailPage suppressionId={slug} />;
}
