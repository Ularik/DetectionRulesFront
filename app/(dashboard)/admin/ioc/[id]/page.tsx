import { IocDetailPage } from "@/views/ioc-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // params приходят URL-кодированными, а id дальше снова кодируется — декодируем
  return <IocDetailPage iocId={decodeURIComponent(id)} />;
}
