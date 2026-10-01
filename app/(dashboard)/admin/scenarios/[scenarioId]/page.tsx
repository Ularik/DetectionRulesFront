import { redirect } from "next/navigation";

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  redirect(`/admin/hunters/scenarios/${encodeURIComponent(scenarioId)}`);
}
