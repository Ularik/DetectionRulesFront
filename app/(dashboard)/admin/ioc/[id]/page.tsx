import { IocDetailPage } from "@/views/ioc-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IocDetailPage iocId={id} />;
}
