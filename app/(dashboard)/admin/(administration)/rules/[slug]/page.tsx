import { RuleDetailPage } from "@/views/rule-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RuleDetailPage ruleId={slug} />;
}
