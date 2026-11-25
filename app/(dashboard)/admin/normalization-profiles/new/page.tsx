import { NormalizationProfileCreatePage } from "@/views/normalization-profile-create";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ copy?: string | string[] }>;
}) {
  const { copy } = await searchParams;
  // ?copy=<имя> — «Дублировать»: форма открывается с копией профиля
  return <NormalizationProfileCreatePage copyFrom={typeof copy === "string" ? copy : undefined} />;
}
