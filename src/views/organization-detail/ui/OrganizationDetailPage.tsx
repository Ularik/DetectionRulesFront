import { OrganizationDetails } from "@/widgets/organization-details";

export function OrganizationDetailPage({
  organizationId,
}: {
  organizationId: string;
}) {
  return <OrganizationDetails organizationId={organizationId} />;
}
