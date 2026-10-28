import { ScenarioDetailPage } from "@/views/scenario-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <ScenarioDetailPage scenarioId={scenarioId} />;
}
