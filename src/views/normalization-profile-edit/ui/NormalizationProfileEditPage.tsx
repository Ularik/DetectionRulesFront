import { EditProfileForm } from "@/features/normalization-profile/upsert";

export function NormalizationProfileEditPage({ name }: { name: string }) {
  return <EditProfileForm name={name} />;
}
