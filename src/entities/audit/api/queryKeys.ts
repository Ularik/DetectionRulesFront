import type { AuditParams } from "../model/types";

export const auditKeys = {
  all: ["audits"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (params: AuditParams) => [...auditKeys.lists(), params] as const,
  detail: (id: string) => [...auditKeys.all, "detail", id] as const,
};
