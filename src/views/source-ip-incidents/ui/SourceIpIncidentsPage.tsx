import { SourceIpIncidents } from "@/widgets/incidents-table";

export function SourceIpIncidentsPage({ sourceIp }: { sourceIp: string }) {
  return <SourceIpIncidents sourceIp={sourceIp} />;
}
