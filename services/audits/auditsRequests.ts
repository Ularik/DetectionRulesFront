import axiosApi from "@/lib/axiosAPi";
import { ApiAuditResponseType, AuditDetailType } from "@/types/audits";


export interface AuditParams {
    limit: number;
    offset: number;
    rule_id?: string;
    user_id?: string;
}

export async function getAudits(params: AuditParams): Promise<ApiAuditResponseType> {
  const result = await axiosApi.get("/audits/", {
    params: params,
  });
  return result.data;
};

export async function getAuditDetail(id: string): Promise<AuditDetailType> {
  const result = await axiosApi.get(`/audits/${id}`);
  return result.data;
};