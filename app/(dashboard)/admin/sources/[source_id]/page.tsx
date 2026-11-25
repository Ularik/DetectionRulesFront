import { SourceDetailPage } from "@/views/source-detail";

export default async function Page({ params }: { params: Promise<{ source_id: string }> }) {
  const { source_id } = await params;
  // params приходят URL-кодированными — декодируем, routes.* закодирует заново
  return <SourceDetailPage sourceId={decodeURIComponent(source_id)} />;
}
