import { NormalizationProfileEditPage } from "@/views/normalization-profile-edit";

export default async function Page({ params }: { params: Promise<{ profile_name: string }> }) {
  const { profile_name } = await params;
  // params приходят URL-кодированными — декодируем, routes.* закодирует заново
  return <NormalizationProfileEditPage name={decodeURIComponent(profile_name)} />;
}
