import { IncidentDetails } from "@/widgets/incident-details";

export function IncidentDetailPage({ incidentId }: { incidentId: string }) {
  return <IncidentDetails incidentId={incidentId} />;
}
