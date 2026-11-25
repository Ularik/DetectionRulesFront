import { SourceIpIncidentsPage } from "@/views/source-ip-incidents";

export default async function Page({
  params,
}: {
  params: Promise<{ sourceIp: string }>;
}) {
  const { sourceIp } = await params;
  return <SourceIpIncidentsPage sourceIp={decodeURIComponent(sourceIp)} />;
}
