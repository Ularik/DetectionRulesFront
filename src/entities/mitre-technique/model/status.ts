import type { MitreTechnique } from "./types";

export type MitreTechniqueStatus = "active" | "revoked" | "deprecated";

export function getMitreTechniqueStatus(
  technique: Pick<MitreTechnique, "revoked" | "deprecated">,
): MitreTechniqueStatus {
  if (technique.revoked) return "revoked";
  if (technique.deprecated) return "deprecated";
  return "active";
}
