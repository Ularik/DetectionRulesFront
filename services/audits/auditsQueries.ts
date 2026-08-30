import { useQuery } from "@tanstack/react-query";
import { getAudits, getAuditDetail, type AuditParams } from "./auditsRequests";

export function useAudits(params: AuditParams) {
  return useQuery({
    queryKey: ["audits", params],
    queryFn: () => getAudits(params),
  });
}

export function useAuditDetail(id: string) {
  return useQuery({
    queryKey: ["audits", id],
    queryFn: () => getAuditDetail(id),
  });
}