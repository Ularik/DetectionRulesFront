"use client";

import { useParams } from "next/navigation";
import ScenarioDetail from "@/components/scenarios/ScenarioDetail";

export default function HuntersScenarioDetailPage() {
  const params = useParams<{ scenarioId: string }>();

  return <ScenarioDetail scenarioId={params.scenarioId} />;
}
