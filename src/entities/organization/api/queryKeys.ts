export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  detail: (organizationId: string) =>
    [...organizationKeys.all, "detail", organizationId] as const,
  agents: () => [...organizationKeys.all, "agents"] as const,
};
