export const sourceKeys = {
  all: ["sources"] as const,
  lists: () => [...sourceKeys.all, "list"] as const,
  detail: (sourceId: string) => [...sourceKeys.all, "detail", sourceId] as const,
  health: (sourceId: string) => [...sourceKeys.all, "health", sourceId] as const,
  sampleEvents: (sourceId: string, size: number) =>
    [...sourceKeys.all, "sample-events", sourceId, size] as const,
};
