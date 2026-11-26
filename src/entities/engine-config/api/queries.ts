import { useQuery } from "@tanstack/react-query";
import { fetchEngineSettings } from "./engineSettingsApi";
import { engineSettingsKeys } from "./queryKeys";

export function useEngineSettings() {
  return useQuery({
    queryKey: engineSettingsKeys.detail(),
    queryFn: fetchEngineSettings,
  });
}
