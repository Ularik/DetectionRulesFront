import { ProfileDetails } from "@/widgets/normalization/details";

export function NormalizationProfileDetailPage({ name }: { name: string }) {
  return <ProfileDetails name={name} />;
}
