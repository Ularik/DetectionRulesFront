import { OrganizationDetailPage } from "@/views/organization-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await params;
  // params приходят URL-кодированными — как и раньше с useParams, декодируем
  return (
    <OrganizationDetailPage
      organizationId={decodeURIComponent(organization_id)}
    />
  );
}
