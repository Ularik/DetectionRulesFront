import { AuditDetailPage } from "@/views/audit-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuditDetailPage auditId={id} />;
}
