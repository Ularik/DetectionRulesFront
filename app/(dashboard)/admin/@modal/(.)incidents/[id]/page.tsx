import { IncidentModalPage } from "@/views/incident-modal";

// Перехват /admin/incidents/[id] при переходе из приложения; прямой заход и F5 открывают полную страницу
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncidentModalPage incidentId={id} />;
}
