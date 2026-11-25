import { MitreTechniqueDetails } from "@/widgets/mitre-techniques";

export function MitreDetailPage({ mitreId }: { mitreId: string }) {
  return <MitreTechniqueDetails mitreId={mitreId} />;
}
