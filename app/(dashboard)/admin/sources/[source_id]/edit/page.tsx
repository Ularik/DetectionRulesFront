import { SourceEditPage } from "@/views/source-edit";

export default async function Page({ params }: { params: Promise<{ source_id: string }> }) {
  const { source_id } = await params;
  // params приходят URL-кодированными — декодируем, routes.* закодирует заново
  return <SourceEditPage sourceId={decodeURIComponent(source_id)} />;
}
