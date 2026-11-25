import { EventModalPage } from "@/views/event-modal";

// Перехват /admin/events/[index_name]/[event_id] при переходе из Raw data; прямой заход и F5 открывают полную страницу
export default async function Page({
  params,
}: {
  params: Promise<{ index_name: string; event_id: string }>;
}) {
  const { index_name, event_id } = await params;
  return (
    <EventModalPage
      indexName={decodeURIComponent(index_name)}
      eventId={decodeURIComponent(event_id)}
    />
  );
}
