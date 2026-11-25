import { CreateProfileForm } from "@/features/normalization-profile/upsert";

export function NormalizationProfileCreatePage({ copyFrom }: { copyFrom?: string }) {
  return <CreateProfileForm copyFrom={copyFrom} />;
}
