export const engineSettingsKeys = {
  all: ["engine-settings"] as const,
  detail: () => [...engineSettingsKeys.all, "detail"] as const,
};
