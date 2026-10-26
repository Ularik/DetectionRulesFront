import { OrganizationEditPage } from "@/views/organization-edit";

export default async function Page({
  params,
}: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await params;
  // params приходят URL-кодированными — как и раньше с useParams, декодируем
  return (
    <OrganizationEditPage organizationId={decodeURIComponent(organization_id)} />
  );
}
