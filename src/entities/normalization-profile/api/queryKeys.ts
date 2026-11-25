export const normalizationProfileKeys = {
  all: ["normalization-profiles"] as const,
  lists: () => [...normalizationProfileKeys.all, "list"] as const,
  detail: (name: string) => [...normalizationProfileKeys.all, "detail", name] as const,
  fields: () => [...normalizationProfileKeys.all, "fields"] as const,
};
