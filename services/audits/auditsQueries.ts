import { useQuery } from "@tanstack/react-query";
import { getAudits, type AuditParams } from "./auditsRequests";


export function useAudits(params: AuditParams) {
  return useQuery({
    queryKey: ["audits", params],
    queryFn: () => getAudits(params),
  });
}