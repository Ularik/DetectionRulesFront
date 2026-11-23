import { MitreDetailPage } from "@/views/mitre-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ mitreId: string }>;
}) {
  const { mitreId } = await params;
  // params приходят URL-кодированными, а id дальше снова кодируется в API — декодируем
  return <MitreDetailPage mitreId={decodeURIComponent(mitreId)} />;
}
