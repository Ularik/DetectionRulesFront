import { NormalizationProfileDetailPage } from "@/views/normalization-profile-detail";

export default async function Page({ params }: { params: Promise<{ profile_name: string }> }) {
  const { profile_name } = await params;
  // params приходят URL-кодированными — декодируем, routes.* закодирует заново
  return <NormalizationProfileDetailPage name={decodeURIComponent(profile_name)} />;
}
