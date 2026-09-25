"use client";

import { useParams } from "next/navigation";
import CorrelationDetailPage from "@/components/crule/CorrelationDetailPage";

export default function CruleDetail() {
  const params = useParams<{ id: string }>();

  return <CorrelationDetailPage correlationId={params.id} />;
}
