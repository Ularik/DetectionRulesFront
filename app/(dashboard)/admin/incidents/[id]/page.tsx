"use client";

import { useParams } from "next/navigation";
import IncidentDetail from "@/components/incidents/IncidentDetail";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();

  return <IncidentDetail incidentId={params.id} />;
}
