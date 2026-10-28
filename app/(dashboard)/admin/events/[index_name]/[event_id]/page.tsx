import { EventDetailPage } from "@/views/event-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ index_name: string; event_id: string }>;
}) {
  const { index_name, event_id } = await params;
  // params приходят URL-кодированными — как и раньше с useParams, декодируем
  return (
    <EventDetailPage
      indexName={decodeURIComponent(index_name)}
      eventId={decodeURIComponent(event_id)}
    />
  );
}
