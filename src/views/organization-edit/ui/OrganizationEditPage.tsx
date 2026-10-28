import { EditOrganizationForm } from "@/features/organization-upsert";

export function OrganizationEditPage({
  organizationId,
}: {
  organizationId: string;
}) {
  return <EditOrganizationForm organizationId={organizationId} />;
}
