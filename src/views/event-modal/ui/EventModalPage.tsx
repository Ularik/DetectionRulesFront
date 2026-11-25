import { RouteModal } from "@/shared/ui/route-modal";
import { EventDetailsBody } from "@/widgets/event-details";

// Детальный просмотр события поверх Raw data (макет CERT-KG SIEM, Figma 536:5147)
export function EventModalPage({ indexName, eventId }: { indexName: string; eventId: string }) {
  return (
    <RouteModal
      title={`Событие ${eventId}`}
      className="block gap-0 rounded-[10px] border-[#e5e7eb] p-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
    >
      <EventDetailsBody indexName={indexName} eventId={eventId} />
    </RouteModal>
  );
}
