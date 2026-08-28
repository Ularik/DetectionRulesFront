import axiosApi from "@/lib/axiosAPi";
import { ApiAuditResponseType } from "@/types/audits";


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