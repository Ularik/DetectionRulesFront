import { useQuery } from "@tanstack/react-query";
import type { AuditParams } from "../model/types";
import { fetchAudit, fetchAudits } from "./auditApi";
import { auditKeys } from "./queryKeys";

export function useAudits(params: AuditParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => fetchAudits(params),
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => fetchAudit(id),
  });
}
