import { IncidentDetailPage } from "@/views/incident-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncidentDetailPage incidentId={id} />;
}
