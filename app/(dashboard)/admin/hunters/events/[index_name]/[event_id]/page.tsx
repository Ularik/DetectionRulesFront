"use client";

import { useParams } from "next/navigation";
import EventDetail from "@/components/events/EventDetail";

export default function HuntersEventDetailPage() {
  const params = useParams<{ index_name: string; event_id: string }>();

  const indexName = decodeURIComponent(params.index_name ?? "");
  const eventId = decodeURIComponent(params.event_id ?? "");

  if (!indexName || !eventId) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-sm text-red-700">
        Не удалось определить событие для просмотра.
      </div>
    );
  }

  return <EventDetail indexName={indexName} eventId={eventId} />;
}
