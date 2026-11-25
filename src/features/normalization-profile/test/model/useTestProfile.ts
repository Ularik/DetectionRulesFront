import { useMutation } from "@tanstack/react-query";
import { testNormalizationProfile } from "@/entities/normalization-profile";

// Тест ничего не сохраняет — кеш не инвалидируем
export function useTestNormalizationProfile() {
  return useMutation({ mutationFn: testNormalizationProfile });
}
