import { AuditDetails } from "@/widgets/audit-details";

export function AuditDetailPage({ auditId }: { auditId: string }) {
  return <AuditDetails auditId={auditId} />;
}
