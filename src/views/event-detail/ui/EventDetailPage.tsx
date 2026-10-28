import { EventDetails } from "@/widgets/event-details";

export function EventDetailPage({
  indexName,
  eventId,
}: {
  indexName: string;
  eventId: string;
}) {
  if (!indexName || !eventId) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-sm text-red-700">
        Не удалось определить событие для просмотра.
      </div>
    );
  }

  return <EventDetails indexName={indexName} eventId={eventId} />;
}
