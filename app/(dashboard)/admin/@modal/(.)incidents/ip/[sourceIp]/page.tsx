import { SourceIpIncidentsModalPage } from "@/views/source-ip-incidents-modal";

// Перехват /admin/incidents/ip/[sourceIp] при переходе из приложения; прямой заход и F5 открывают полную страницу
export default async function Page({
  params,
}: {
  params: Promise<{ sourceIp: string }>;
}) {
  const { sourceIp } = await params;
  return <SourceIpIncidentsModalPage sourceIp={decodeURIComponent(sourceIp)} />;
}
