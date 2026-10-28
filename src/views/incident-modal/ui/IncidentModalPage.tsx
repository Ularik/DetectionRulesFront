import { RouteModal } from "@/shared/ui/route-modal";
import { IncidentDetailsBody } from "@/widgets/incident-details";

// Детальный просмотр поверх списка инцидентов (макет CERT-KG SIEM, фрейм «modal»)
export function IncidentModalPage({ incidentId }: { incidentId: string }) {
  return (
    <RouteModal
      title={`Инцидент ${incidentId}`}
      className="block gap-0 rounded-[10px] border-gray-200 p-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
    >
      <IncidentDetailsBody incidentId={incidentId} variant="modal" />
    </RouteModal>
  );
}
