import { axiosApi } from "@/shared/api";
import type {
  ApiAuditResponseType,
  AuditDetailType,
  AuditParams,
} from "../model/types";

export async function fetchAudits(
  params: AuditParams,
): Promise<ApiAuditResponseType> {
  const result = await axiosApi.get<ApiAuditResponseType>("/audits/", {
    params,
  });
  return result.data;
}

export async function fetchAudit(id: string): Promise<AuditDetailType> {
  const result = await axiosApi.get<AuditDetailType>(`/audits/${id}`);
  return result.data;
}
